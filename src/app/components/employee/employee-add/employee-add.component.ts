import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmployeeService } from '../../../services/employee.service';
import { MessageService } from 'primeng/api';
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css'],
  providers: [MessageService]
})
export class EmployeeAddComponent implements OnInit {
  @ViewChild('startDateCalendar', { static: true }) startDateCalendar!: Calendar;
  @ViewChild('endDateCalendar', { static: true }) endDateCalendar!: Calendar;

  employeeForm: FormGroup;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  tempStartDate: Date | null = null;
  tempEndDate: Date | null = null;
  isEditMode = false;
  employeeId: string | null = null;
  dateFormat: string = "dd/mm/yy";

  roles: any[] = [
    { label: 'Developer', value: 'Developer' },
    { label: 'Designer', value: 'Designer' },
    { label: 'Manager', value: 'Manager' },
    { label: 'HR', value: 'HR' },
    { label: 'QA Engineer', value: 'QA Engineer' }
  ];

  headerOptions = [
    { label: 'Today', value: new Date() },
    { label: 'Next Monday', value: this.getNextMonday() },
    { label: 'Next Tuesday', value: this.getNextTuesday() },
    { label: 'After 1 week', value: this.getDateAfterOneWeek() }
  ];

  headerOptionsEnd = [
    { label: 'No date', value: null },
    { label: 'Today', value: new Date() },
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private cdRef: ChangeDetectorRef
  ) {
    this.employeeForm = this.createForm();
    this.initializeComponent();
  }

  ngOnInit() {}

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [null]
    });
  }

  private initializeComponent() {
    if (this.config.data?.employeeId) {
      this.isEditMode = true;
      this.employeeId = this.config.data.employeeId;
      this.loadEmployeeData();
    } else {
      // Initialize selected dates from form values for add mode
      this.selectedStartDate = this.employeeForm.get('startDate')?.value;
      this.selectedEndDate = this.employeeForm.get('endDate')?.value;
      this.tempStartDate = this.selectedStartDate;
      this.tempEndDate = this.selectedEndDate;
    }
  }

  private async loadEmployeeData() {
    try {
      const employee = await this.employeeService.getEmployeeById(this.employeeId!);
      this.employeeForm.patchValue({
        name: employee.name,
        role: employee.role,
        startDate: new Date(employee.startDate),
        endDate: employee.endDate ? new Date(employee.endDate) : null
      });

      this.selectedStartDate = employee.startDate ? new Date(employee.startDate) : null;
      this.selectedEndDate = employee.endDate ? new Date(employee.endDate) : null;
      this.tempStartDate = this.selectedStartDate;
      this.tempEndDate = this.selectedEndDate;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load employee data'
      });
    }
  }

  getNextMonday(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() + (8 - day);
    date.setDate(diff);
    return date;
  }

  getNextTuesday(): Date {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() + (9 - day);
    date.setDate(diff);
    return date;
  }

  getDateAfterOneWeek(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  }

  getMinDate(): Date {
    // If start date is selected, use it getMinDate minimum date
    // Otherwise use today's date
    const minDate = this.selectedStartDate || new Date();
    minDate.setHours(0, 0, 0, 0); // Set time to start of day
    return minDate;
  }

  isSelectedDate(optionDate: Date | null, selectedDate: Date | null): boolean {
    // If both dates are null, they match
    if (optionDate === null && selectedDate === null) {
      return true;
    }

    // If only one date is null, they don't match
    if (optionDate === null || selectedDate === null) {
      return false;
    }

    // Compare the dates after setting hours to 0
    const option = new Date(optionDate);
    const selected = new Date(selectedDate);
    return option.setHours(0, 0, 0, 0) === selected.setHours(0, 0, 0, 0);
  }

  onHeaderOptionSelect(date: Date | null, controlName: string) {
    if (controlName === 'startDate') {
      this.tempStartDate = date ? new Date(date) : null;
      this.selectedStartDate = this.tempStartDate;
      this.employeeForm.get('startDate')?.setValue(this.tempStartDate);
    } else {
      this.tempEndDate = date ? new Date(date) : null;
      this.selectedEndDate = this.tempEndDate;
      this.employeeForm.get('endDate')?.setValue(this.tempEndDate);
    }
  }

  onDateSelect(date: Date, controlName: string) {
    if (controlName === 'startDate') {
      this.tempStartDate = date;
      this.selectedStartDate = date;
      this.employeeForm.get('startDate')?.setValue(date);
      this.startDateCalendar.updateInputfield();
      this.cdRef.detectChanges();
    } else { // controlName === 'endDate'
      this.tempEndDate = date;
      this.selectedEndDate = date;
      this.employeeForm.get('endDate')?.setValue(date);
      this.endDateCalendar.updateInputfield();
      this.cdRef.detectChanges();
    }
  }

  onCalendarShow(controlName: string) {
    // Reset temp dates to current selected dates when showing the overlay
    if (controlName === 'startDate') {
      this.tempStartDate = this.selectedStartDate ? new Date(this.selectedStartDate) : null;
      // Ensure the calendar UI reflects this temp date when opened
      if (this.startDateCalendar) {
        this.startDateCalendar.value = this.tempStartDate;
      }
    } else {
      this.tempEndDate = this.selectedEndDate ? new Date(this.selectedEndDate) : null;
      if (this.endDateCalendar) {
        this.endDateCalendar.value = this.tempEndDate;
      }
    }
  }

  onCalendarSave(controlName: string) {
    if (controlName === 'startDate') {
      this.employeeForm.get('startDate')?.setValue(this.selectedStartDate);
      this.startDateCalendar.hideOverlay();
    } else {
      this.selectedEndDate = this.tempEndDate;
      this.employeeForm.get('endDate')?.setValue(this.tempEndDate);
      this.endDateCalendar.hideOverlay();
    }
  }

  onCalendarCancel(controlName: string) {
    if (controlName === 'startDate') {
      this.tempStartDate = this.selectedStartDate;
      this.selectedStartDate = new Date();
      this.startDateCalendar.hideOverlay();
    } else {
      this.tempEndDate = this.selectedEndDate;
      this.endDateCalendar.hideOverlay();
    }
  }

  async onSubmit() {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.value;
      try {
        if (this.isEditMode) {
          await this.employeeService.updateEmployee(this.employeeId!, {
            name: formValue.name,
            role: formValue.role,
            startDate: formValue.startDate,
            endDate: formValue.endDate
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee updated successfully'
          });
        } else {
          await this.employeeService.createEmployee({
            name: formValue.name,
            role: formValue.role,
            startDate: formValue.startDate,
            endDate: formValue.endDate
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee added successfully'
          });
        }
        this.ref.close(true);
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.isEditMode ? 'Failed to update employee' : 'Failed to add employee'
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields correctly'
      });
    }
  }

  onCancel() {
    this.ref.close();
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    
    const today = new Date();
    const selected = new Date(date);
    
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    
    return today.getTime() === selected.getTime();
  }
}
