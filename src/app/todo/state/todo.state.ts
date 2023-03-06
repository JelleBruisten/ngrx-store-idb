export interface TodoState {
  todoList: string[],
  lastUpdate: number | null
}

export const initialState: TodoState = {
  todoList: [],
  lastUpdate: null
};