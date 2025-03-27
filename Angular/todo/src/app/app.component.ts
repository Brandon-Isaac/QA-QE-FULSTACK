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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
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
