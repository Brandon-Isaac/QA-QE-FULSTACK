import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./todo-item.component.html`,
  styleUrls: [`./todo-item.component.css`],
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Input() detailed = false;
}
