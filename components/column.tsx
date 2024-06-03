import { ColumnsResponseItem } from "@/types/tables";
import style from '@/styles/table.module.css';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Textarea } from "@nextui-org/react";
import { useRef, useState } from "react";

import closeIcon from '@/public/close.svg'
import menuIcon from '@/public/menu-dots-svgrepo-com.svg'
import Image from 'next/image'
import axios from "axios";
import { ApiConfig } from "@/config/api";
import { parseCookies } from "nookies";
import TaskWidget from "./task";
import { useDrop } from "react-dnd";
import toast, { Toaster } from "react-hot-toast";


type Column = {
    item: ColumnsResponseItem,
    updateTable: () => void
}

export default function ColumnWidget({item, updateTable}: Column){

    const [isAddTask, setAddTask] = useState(false)
    const [isLoadingAddTask, setLoadingAddTask] = useState(false)
    const addTaskInputRef = useRef<HTMLTextAreaElement>(null)
    const [column, setColumn] = useState(item)

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'task',
        drop: () => ({ columnId: item.id }),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        }),
        hover: (item, monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
      }))

    const cookies = parseCookies()
    const token = cookies.accessToken
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    }

    const deleteColumn = async () => {
        const data = {
            column_id: column.id
        }

        try{
            const response = await axios.delete(
                `${ApiConfig.baseUrl}/columns/${column.id}`,
                config
            )
            toast.success(
                "Успешно удалено!",
                {
                    position: 'bottom-center',
                    duration: 1000
                }
            )
            updateTable()
        }
        catch{
            toast.error(
                "Ошибка сервера!",
                {
                    position: 'bottom-center',
                    duration: 1000
                }
            )
        }
        
    }

    const createTask = async () => {
        setLoadingAddTask(true)
        const title = addTaskInputRef.current?.value;

        const data = {
            title: title,
            description: "",
            column_id: item.id,
            table_id: item.table_id
        }

        try{
            const response = await axios.post(
                `${ApiConfig.baseUrl}/tasks`,
                data,
                config
            )

            const columnResponse = await axios.get(
                `${ApiConfig.baseUrl}/columns/${item.id}`,
                config
            )

            console.log(columnResponse.data)

            setColumn(columnResponse.data)
        }
        catch{

        }
        finally{
            setLoadingAddTask(false)
            setAddTask(false)
        }
    }

    const isActive = canDrop && isOver

    return (
        <>
            <div ref={drop} className={style.column_block}>
                <div className="flex flex-row place-content-between">
                    <p>{column.title}</p>
                    <Dropdown>
                        <DropdownTrigger>
                            <Image
                                src={menuIcon.src}
                                alt=""
                                width={24}
                                height={24}
                                className={style.menu_column_icon}
                                // onClick={() => setAddTask(false)}
                            />
                        </DropdownTrigger>
                        <DropdownMenu onAction={(key) => {
                            if (key == 'delete'){
                                deleteColumn()
                            }
                        }}>
                            <DropdownItem key="delete" className="text-danger" color="danger">Удалить</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <span className={`${style.drop_block} ${isActive ? '' : style.hidden}`}>

                </span>
                <span className={style.task_block}>
                    {
                        [...Array(column.tasks.length)]
                            .map(
                                (_, index) => <TaskWidget
                                    key={`task-${index}-${column.tasks[index].id}`}
                                    updateTable={() => updateTable()}
                                    item={column.tasks[index]}
                                />
                            )
                    }
                </span>
                <Button className={`${style.column_add_task} ${isAddTask ? style.hidden : ''}`} onClick={() => setAddTask(true)}>
                    + Добавить карточку
                </Button>

                <span className={`${!isAddTask ? style.hidden : ''}`}>
                    <Textarea
                        className={style.column_add_task_input} 
                        placeholder="Введите заголовок для этой карточки"
                        maxRows={4}
                        ref={addTaskInputRef}
                    />
                    <span className="flex flex-row items-center mt-[10px]">
                        <Button 
                            className={style.column_add_task_button} 
                            isLoading={isLoadingAddTask}
                            onClick={createTask}
                        >
                            Добавить карточку
                        </Button>
                        <Image
                            src={closeIcon.src}
                            alt=""
                            width={15}
                            height={15}
                            className={style.column_add_task_close}
                            onClick={() => setAddTask(false)}
                        />
                    </span>
                </span>
            </div>
            <Toaster/>
        </>
    )
}