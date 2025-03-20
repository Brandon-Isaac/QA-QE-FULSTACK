import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoFormComponent } from '../app/components/todo-form/todo-form.component';
import { TodoListComponent } from '../app/components/todo-list/todo-list.component';
import { TodoItemComponent } from '../app/components/todo-item/todo-item.component';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TodoFormComponent,
    TodoListComponent,
    TodoItemComponent,
  ],
  template: `
    <div class="container">
      <h1>Todo List Application</h1>
      <app-todo-form (addTodo)="addTodo($event)"></app-todo-form>
      <app-todo-list
        [todos]="todos"
        (selectTodo)="selectTodo($event)"
        (deleteTodo)="deleteTodo($event)"
      ></app-todo-list>
      <div *ngIf="selectedTodo" class="current-todo">
        <h2>Current Todo</h2>
        <app-todo-item [todo]="selectedTodo" [detailed]="true"></app-todo-item>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      h1 {
        color: #2c3e50;
        text-align: center;
      }
      .current-todo {
        margin-top: 30px;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #3498db;
        margin-top: 0;
      }
    `,
  ],
})
export class AppComponent {
  todos: Todo[] = [];
  selectedTodo: Todo | null = null;

  addTodo(todo: Todo) {
    this.todos = [...this.todos, todo];
    this.selectedTodo = todo;
  }

  selectTodo(todo: Todo) {
    this.selectedTodo = todo;
  }

  deleteTodo(id: string) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    if (this.selectedTodo && this.selectedTodo.id === id) {
      this.selectedTodo = null;
    }
  }
}
