import { ApiConfig } from '@/config/api'
import axios from 'axios'
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import nookies from 'nookies'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import style from '@/styles/table.module.css';
import { TablesResponseItem } from '@/types/tables'
import exit from '@/public/exit.svg'
import Image from 'next/image'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { useRef, useState } from 'react'
import ColumnWidget from '../../components/column'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


export const getServerSideProps = (async (ctx) => {

    const tableId = ctx.params?.id;

    const cookies = nookies.get(ctx)
    console.log(cookies)
    const token = cookies.accessToken

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    // console.log(tableId)
    try{
        const table = await axios.get(
            `${ApiConfig.baseUrl}/tables/${tableId}`, config
        )
        console.log(table.data)
        const repo: TablesResponseItem | null = table.data
        return { props: { repo } }
    }
    catch(error){
        // console.log(error)
        const repo: TablesResponseItem | null = null
        return { props: { repo } }
    }
    
}) satisfies GetServerSideProps<{ repo: TablesResponseItem | null }>

export default function TableView({
    repo
}: InferGetServerSidePropsType<typeof getServerSideProps>){
    const cookies = parseCookies()
    const token = cookies.accessToken
    const config = {
        headers: { Authorization: `Bearer ${token}` },
    }

    const router = useRouter();
    const { id } = router.query;

    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const columnNameRef = useRef<HTMLInputElement>(null)
    const [isLoadingCreateColumn, setLoadingCreateColumn] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const updateTable = async () => {
        setLoading(true)
        try{

            const table = await axios.get(
                `${ApiConfig.baseUrl}/tables/${id}`, config
            )

            console.log(table.data)

            setTable(table.data)
        }
        catch(error){

        }
        finally{
            setLoading(false)
        }
    }

    const createColumn = async (closeModal: () => void) => {
        setLoadingCreateColumn(true)

        try{
            const data = {
                table_id: id,
                title: columnNameRef.current?.value
            }
            const response = await axios.post(
                `${ApiConfig.baseUrl}/columns`,
                data,
                config
            )

            await updateTable()

        }
        catch(error){

        }
        finally{
            setLoadingCreateColumn(false)
            closeModal()
        }
    }

    console.log(repo)

    if (repo == null){
        return (
            <div>
                error!
            </div>
        )
    }

    const [table, setTable] = useState<TablesResponseItem>(repo)


    return (
        <>
            <div className={style.main}>
                <span className='flex flex-row justify-between items-end'>
                        <p className={style.title}>{table.title}</p>
                        <Image
                            src={exit.src}
                            alt=''
                            width={20}
                            height={20}
                            className={style.exit}
                            onClick={() => router.push('/profile')}
                        />
                </span>
                <DndProvider backend={HTML5Backend}>
                    <div className={style.columns}>
                        {

                            [...Array(table.columns.length)]
                                .map(
                                    (_, index) => {
                                        const column = table.columns[index]

                                        const key = isLoading ? 'loading' : 'no-loading'

                                        return <ColumnWidget 
                                            key={`column-${index}-${column.id}-${key}`}
                                            updateTable={() => updateTable()}
                                            item={column}
                                        />
                                    }
                                )
                        }

                        <Button className={style.create_column} onClick={onOpenChange}>
                            + Добавьте колонку
                        </Button>
                    </div>
                </DndProvider>
            </div>

            <Modal
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                placement="top-center"
                backdrop={'blur'}
            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Введите название для новой колонки</ModalHeader>
                                <ModalBody>
                                <Input
                                    ref={columnNameRef}
                                    autoFocus
                                    label="Название"
                                    variant="bordered"
                                    />
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="danger" variant="flat" onPress={onClose}>
                                        Отмена
                                    </Button>
                                    <Button 
                                        color="primary" 
                                        onPress={() => createColumn(onClose)} 
                                        isLoading={isLoadingCreateColumn}
                                    >
                                        Создать
                                    </Button>
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            
            </Modal>
        </>
    )
}