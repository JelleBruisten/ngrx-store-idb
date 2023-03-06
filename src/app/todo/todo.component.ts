import { Component } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { addTodo, removeTodo, resetTodo } from './state/todo.actions';
import { AsyncPipe, CommonModule } from '@angular/common';
import { selectTodoLastUpdate, selectTodoList } from './state/todo.selectors';
import { PushModule } from '@ngrx/component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    PushModule
  ],
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent {
  todoList$: Observable<string[]>
  lastUpdate$: Observable<Date | null>;
 
  constructor(private store: Store<{ lazy: number }>) {
    this.todoList$ = store.select(selectTodoList);
    this.lastUpdate$ = store.select(selectTodoLastUpdate);
  }
 
  addTodo(todo: string) {
    this.store.dispatch(addTodo({
      todo: todo
    }));
  }
 
  removeTodo(index: number) {
    this.store.dispatch(removeTodo({
      index: index
    }));
  }
 
  reset() {
    this.store.dispatch(resetTodo());
  }
}
