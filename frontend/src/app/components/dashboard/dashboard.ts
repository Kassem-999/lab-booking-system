import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth';
import { Equipment, EquipmentService } from '../../services/equipment';
import { Reservation, ReservationService } from '../../services/reservation';
import { UsersService } from '../../services/users';
import { Lab, LabService } from '../../services/lab';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  equipment: Equipment[] = [];
  reservations: Reservation[] = [];
  users: User[] = [];
  labs: Lab[] = [];
  metrics = { equipment: 0, activeBookings: 0, pendingApprovals: 0, users: 0 };
  activeTab = 'labs';
  page = 1;
  pageCount = 1;
  totalItems = 0;
  search = '';
  category = '';
  availability = '';
  sort = 'newest';
  selected: Equipment | null = null;
  modalMode: 'booking' | 'user' | 'editUser' | 'equipment' | 'lab' | 'editLab' = 'booking';
  newUser = { name: '', email: '', password: '', role: 'staff' as User['role'] };
  editingUser: User | null = null;
  newEquipment = { name: '', category: '', description: '', condition: 'good', availability: 'available' };
  newLab = { name: '', capacity: 1, equipment: '', description: '', status: 'available' as 'available' | 'maintenance' };
  newLabPhoto: File | null = null;
  editingLab: Lab | null = null;
  calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  booking = { startDate: '', endDate: '', notes: '' };
  loading = false;
  message = '';
  error = '';

  private auth = inject(AuthService);
  private equipmentService = inject(EquipmentService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private labService = inject(LabService);

  ngOnInit(): void {
    this.user = this.auth.getUser();
    this.loadEquipment();
    this.loadReservations();
    this.loadLabs();
    if (this.isAdmin) {
      fetch('http://localhost:5000/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${this.auth.getToken()}` }
      }).then((response) => response.json()).then((response) => this.metrics = response.data).catch(() => undefined);
    }
  }

  get isManager(): boolean { return this.user?.role === 'staff' || this.user?.role === 'admin'; }
  get isAdmin(): boolean { return this.user?.role === 'admin'; }
  get pendingReservations(): Reservation[] { return this.reservations.filter((item) => item.status === 'pending'); }
  get calendarLabel(): string { return this.calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
  get calendarDays(): Array<{ date: Date; currentMonth: boolean }> {
    const first = new Date(this.calendarMonth);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { date, currentMonth: date.getMonth() === first.getMonth() };
    });
  }

  loadEquipment(): void {
    this.loading = true;
    this.equipmentService.list({ search: this.search, category: this.category, availability: this.availability, sort: this.sort }).subscribe({
      next: (response) => {
        this.equipment = response.data;
        this.pageCount = response.pagination.pages;
        this.totalItems = response.pagination.total;
        this.loading = false;
      },
      error: (error) => { this.error = error.error?.message || 'Unable to load equipment'; this.loading = false; }
    });
  }

  loadReservations(): void {
    this.reservationService.list().subscribe({
      next: (response) => this.reservations = response.data,
      error: () => this.error = 'Unable to load reservations'
    });
  }

  openBooking(item: Equipment): void {
    this.modalMode = 'booking';
    this.selected = item;
    this.booking = { startDate: '', endDate: '', notes: '' };
    this.message = '';
    this.error = '';
  }

  openUserModal(): void {
    this.modalMode = 'user';
    this.newUser = { name: '', email: '', password: '', role: 'staff' };
    this.error = '';
  }

  openEditUser(account: User): void {
    this.modalMode = 'editUser';
    this.editingUser = account;
    this.newUser = { name: account.name, email: account.email, password: '', role: account.role };
    this.error = '';
  }

  openEquipmentModal(): void {
    this.modalMode = 'equipment';
    this.newEquipment = { name: '', category: '', description: '', condition: 'good', availability: 'available' };
    this.error = '';
  }

  openLabModal(): void {
    this.editingLab = null;
    this.modalMode = 'lab';
    this.newLab = { name: '', capacity: 1, equipment: '', description: '', status: 'available' };
    this.newLabPhoto = null;
    this.error = '';
  }

  openEditLab(lab: Lab): void {
    this.editingLab = lab;
    this.modalMode = 'editLab';
    this.newLab = {
      name: lab.name,
      capacity: lab.capacity,
      equipment: lab.equipment.join(', '),
      description: lab.description,
      status: lab.isAvailable ? 'available' : 'maintenance'
    };
    this.newLabPhoto = null;
    this.error = '';
  }

  onLabPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newLabPhoto = input.files?.[0] || null;
  }

  submitLab(): void {
    const isUpdate = !!this.editingLab;
    const action = isUpdate
      ? this.labService.update(this.editingLab!._id, { ...this.newLab, photo: this.newLabPhoto })
      : this.labService.create({ ...this.newLab, photo: this.newLabPhoto });
    action.subscribe({
      next: () => {
        this.modalMode = 'booking';
        this.editingLab = null;
        this.newLabPhoto = null;
        this.message = isUpdate ? 'Lab updated successfully.' : 'Lab added successfully.';
        this.loadLabs();
      },
      error: (error) => this.error = error.error?.message || 'Unable to add lab'
    });
  }

  loadLabs(): void {
    this.labService.list().subscribe({
      next: (response) => this.labs = response.data,
      error: (error) => this.error = error.error?.message || 'Unable to load labs'
    });
  }

  submitUser(): void {
    this.usersService.create(this.newUser).subscribe({
      next: () => { this.selected = null; this.modalMode = 'booking'; this.message = 'Staff account created successfully.'; this.loadUsers(); },
      error: (error) => this.error = error.error?.message || 'Unable to create account'
    });
  }

  submitEditUser(): void {
    if (!this.editingUser) return;
    this.usersService.update(String(this.editingUser.id), {
      name: this.newUser.name,
      email: this.newUser.email,
      role: this.newUser.role
    }).subscribe({
      next: (response) => {
        const updated = response.data;
        this.users = this.users.map((account) => String(account.id) === String(updated.id) ? updated : account);
        if (this.user && String(this.user.id) === String(updated.id)) {
          this.auth.saveSession({ token: this.auth.getToken() || '', user: updated });
          this.user = updated;
        }
        this.editingUser = null;
        this.modalMode = 'booking';
        this.message = 'User updated successfully.';
      },
      error: (error) => this.error = error.error?.message || 'Unable to update user'
    });
  }

  submitEquipment(): void {
    this.equipmentService.create(this.newEquipment).subscribe({
      next: () => { this.selected = null; this.modalMode = 'booking'; this.message = 'Equipment added successfully.'; this.loadEquipment(); },
      error: (error) => this.error = error.error?.message || 'Unable to add equipment'
    });
  }

  changeMonth(offset: number): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), this.calendarMonth.getMonth() + offset, 1);
  }

  reservationsForDay(date: Date): Reservation[] {
    return this.reservations.filter((item) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      return date >= new Date(start.getFullYear(), start.getMonth(), start.getDate())
        && date <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  submitBooking(): void {
    if (!this.selected) return;
    this.error = '';
    this.reservationService.create({ equipment: this.selected._id, ...this.booking }).subscribe({
      next: () => { this.message = 'Reservation submitted for approval.'; this.selected = null; this.loadReservations(); },
      error: (error) => this.error = error.error?.message || 'Unable to create reservation'
    });
  }

  updateStatus(item: Reservation, status: Reservation['status']): void {
    this.reservationService.updateStatus(item._id, status).subscribe({
      next: () => { this.message = `Reservation ${status}.`; this.loadReservations(); },
      error: (error) => this.error = error.error?.message || 'Unable to update reservation'
    });
  }

  logout(): void { this.auth.logout(); this.router.navigate(['/login']); }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'reservations' || tab === 'approvals') this.loadReservations();
    if (tab === 'users' && this.isAdmin) this.loadUsers();
    if (tab === 'calendar') this.loadReservations();
  }

  setPage(page: number): void {
    if (page < 1 || page > this.pageCount || page === this.page) return;
    this.page = page;
    this.loadEquipment();
  }

  loadUsers(): void {
    this.usersService.list().subscribe({
      next: (response) => this.users = response.data,
      error: (error) => this.error = error.error?.message || 'Unable to load users'
    });
  }
}
