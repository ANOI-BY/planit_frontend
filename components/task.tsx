import { ApiConfig } from '@/config/api';
import style from '@/styles/table.module.css';
import { TaskResponseItem } from "@/types/tables"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from '@nextui-org/react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useState } from 'react';
import { useDrag } from 'react-dnd';

type Task = {
    item: TaskResponseItem,
    updateTable: () => void
}

interface DropResult {
    columnId: number
}

export default function TaskWidget({item, updateTable}: Task){

    const [description, setDescription] = useState(item.description);
    const [isChanged, setChanged] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [task, setTask] = useState(item)
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const cookies = parseCookies()
    const token = cookies.accessToken
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    }

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'task',
        item: {task},
        end: async (item, monitor) => {
            const dropResult = monitor.getDropResult<DropResult>()
            
            if (item && dropResult) {
                const taskId = item.task.id
                const columnId = dropResult.columnId
                
                try{
                    const configWithQuery = {
                        ...config,
                        params: {
                            column_id: columnId
                        }
                    }
                    const response = await axios.put(
                        `${ApiConfig.baseUrl}/tasks/${taskId}/move`,
                        {}, configWithQuery
                    )

                    updateTable()
                }
                catch(error){

                }

                console.log(`You dropped ${item.task.id} into ${dropResult.columnId}!`)
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }))

    const changeDescription = (value: string) => {
        if (value == item.description){
            setChanged(false)
        }
        else{
            setChanged(true)
        }
        setDescription(value)
    }

    const updateTask = async (closeModal: () => void) => {
        setLoading(true)

        try{
            task.description = description;
            const response = await axios.put(
                `${ApiConfig.baseUrl}/tasks/${task.id}`,
                task,
                config
            )

            setTask(response.data)
        }
        catch(error){

        }
        finally{
            setLoading(false)
            closeModal()
        }
    }

    const opacity = isDragging ? 0.4 : 1

    return(
        <>
            <div 
                ref={drag} 
                className={style.task} 
                style={{opacity: opacity}} 
                onClick={onOpenChange}
                data-testid={`task`}
            >
                <p>{task.title}</p>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                backdrop={'blur'}
                placement="top-center"
            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">
                                    {task.title}
                                </ModalHeader>
                                <ModalBody>
                                    <p>Описание</p>
                                    <Textarea
                                        value={description}
                                        onChange={(event) => changeDescription(event.currentTarget.value)}
                                        placeholder='Добавьте более подробное описание...'
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    {
                                        isChanged &&

                                        <Button 
                                            color="primary" 
                                            onPress={() => updateTask(onClose)} 
                                            isLoading={isLoading}
                                        >
                                            Сохранить
                                        </Button>
                                    }
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>
        </>
    )
}