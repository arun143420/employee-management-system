import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private dbName = 'EmployeeDB';
  private storeName = 'employees';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => {
        console.error('Error opening database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('role', 'role', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }

  async getEmployees(): Promise<Employee[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    const db = await this.getDB();
    const newEmployee: Employee = {
      ...employee,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(newEmployee);

      request.onsuccess = () => {
        resolve(newEmployee);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async getEmployeeById(id: string): Promise<Employee> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          reject(new Error('Employee not found'));
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateEmployee(id: string, employee: Partial<Employee>): Promise<Employee> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // First get the existing employee
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Employee not found'));
          return;
        }

        // Merge existing employee with updates
        const updatedEmployee = {
          ...getRequest.result,
          ...employee
        };

        // Put the updated employee back
        const putRequest = store.put(updatedEmployee);
        
        putRequest.onsuccess = () => {
          resolve(updatedEmployee);
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  }

  async deleteEmployee(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}
