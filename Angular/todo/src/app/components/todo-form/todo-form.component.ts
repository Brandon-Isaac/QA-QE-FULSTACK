import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css'],
})
export class TodoFormComponent {
  @Output() addTodo = new EventEmitter<Todo>();

  title = '';
  description = '';
  priority: 'low' | 'medium' | 'high' = 'medium';
  dueDate = '';

  onSubmit() {
    if (!this.title.trim()) {
      alert('Title is required!');
      return;
    }

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: this.title,
      description: this.description,
      priority: this.priority,
      dueDate: this.dueDate ? new Date(this.dueDate) : new Date(),
      createdAt: new Date(),
      completed: false,
    };

    this.addTodo.emit(newTodo);

    // Reset form
    this.title = '';
    this.description = '';
    this.priority = 'medium';
    this.dueDate = '';
  }
}
