import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: `./todo-list.component.html`,
  styleUrls: [`./todo-list.component.css`],
})
export class TodoListComponent {
  @Input() todos: Todo[] = [];
  @Output() selectTodo = new EventEmitter<Todo>();
  @Output() deleteTodo = new EventEmitter<string>();

  onSelectTodo(todo: Todo) {
    this.selectTodo.emit(todo);
  }

  onDeleteTodo(id: string, event: Event) {
    event.stopPropagation();
    this.deleteTodo.emit(id);
  }
}
