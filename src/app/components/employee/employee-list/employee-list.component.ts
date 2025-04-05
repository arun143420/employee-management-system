import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../../services/employee.service';
import { Employee } from '../../../models/employee.model';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { EmployeeAddComponent } from '../employee-add/employee-add.component';
import { ConfirmationService } from 'primeng/api';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
  providers: [MessageService, DialogService, ConfirmationService],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease-out', style({ 
            opacity: 0, 
            transform: 'translateX(-20px)'
          }))
        ], { optional: true })
      ])
    ]),
    trigger('rowAnimation', [
      transition(':leave', [
        animate('300ms ease-out', style({ 
          opacity: 0, 
          transform: 'translateX(-20px)'
        }))
      ])
    ])
  ]
})
export class EmployeeListComponent implements OnInit {
  currentEmployees: Employee[] = [];
  previousEmployees: Employee[] = [];
  loading: boolean = true;

  constructor(
    private employeeService: EmployeeService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      this.loading = true;
      const employees = await this.employeeService.getEmployees();
      
      // Filter current employees (endDate is null)
      this.currentEmployees = employees.filter(emp => emp.endDate === null);
      
      // Filter previous employees (endDate is not null)
      this.previousEmployees = employees.filter(emp => emp.endDate !== null);
      
      // Sort by start date
      this.currentEmployees.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      this.previousEmployees.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load employees'
      });
    } finally {
      this.loading = false;
    }
  }

  openAddEmployeeDialog() {
    const ref = this.dialogService.open(EmployeeAddComponent, {
      header: 'Add Employee',
      width: '90vw',
      style: { 'max-width': '450px' },
      contentStyle: { 'padding': '1.5rem' },
      baseZIndex: 10000,
      closeOnEscape: true
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  onEditEmployee(employee: Employee) {
    const ref = this.dialogService.open(EmployeeAddComponent, {
      header: 'Edit Employee',
      width: '90vw',
      style: { 'max-width': '450px' },
      contentStyle: { 'padding': '1.5rem' },
      baseZIndex: 10000,
      closeOnEscape: true,
      data: {
        employeeId: employee.id
      }
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  onDeleteEmployee(employee: Employee) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.employeeService.deleteEmployee(employee.id!);
          this.currentEmployees = this.currentEmployees.filter(e => e.id !== employee.id);
          this.previousEmployees = this.previousEmployees.filter(e => e.id !== employee.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee deleted successfully'
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete employee'
          });
        }
      }
    });
  }
}
