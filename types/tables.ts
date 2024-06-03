export type TablesResponseItem = {
    title: string,
    id: number,
    columns: ColumnsResponseItem[]
}

export type ColumnsResponseItem = {
    id: number,
    title: string,
    table_id: number,
    tasks: TaskResponseItem[]
}

export type TaskResponseItem = {
    id: number,
    title: string,
    description: string,
    column_id: number,
    table_id: number
}