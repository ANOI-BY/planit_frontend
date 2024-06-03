import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import style from "@/styles/profile.module.css";
import axios from 'axios';
import { TablesResponseItem } from '@/types/tables';
import nookies from 'nookies'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from '@nextui-org/react';
import { useEffect, useRef, useState } from 'react';
import { ApiConfig } from '@/config/api';
import deleteIcon from '@/public/delete.svg'
import exit from '@/public/exit.svg'
import Image from 'next/image'
import { useRouter } from 'next/router';

export const getServerSideProps = (async (ctx) => {

    const cookies = nookies.get(ctx)
    const token = cookies.accessToken

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    // console.log(config)
    const tables = await axios.get(
        `${ApiConfig.baseUrl}/tables`, config
    )

	const repo: TablesResponseItem[] = tables.data
    return { props: { repo } }
}) satisfies GetServerSideProps<{ repo: TablesResponseItem[] }>

export default function ProfilePage({
    repo,
}: InferGetServerSidePropsType<typeof getServerSideProps>){

    const router = useRouter()
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const {
        isOpen: isOpenDelete, 
        onOpen: onOpenDelete, 
        onOpenChange: onOpenChangeDelete
    } = useDisclosure();

    const [isLoadingCreateTable, setLoadingCreateTable] = useState(false)
    const [isLoadingDeleteTable, setLoadingDeleteTable] = useState(false)
    const tableTitleRef = useRef<HTMLInputElement>(null)
    const [tables, setTables] = useState<TablesResponseItem[]>(repo)
    const [selectedTable, setSelectedTable] = useState<TablesResponseItem|null>(null)

    const createTable = async (closeModal: () => void) => {
        setLoadingCreateTable(true)
        const cookies = parseCookies()
        const token = cookies.accessToken
        
        try{
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            }
            const data = {
                title: tableTitleRef.current?.value
            }
            const response = await axios.post(
                `${ApiConfig.baseUrl}/tables`, 
                data,
                config
            )

            const newTables = await axios.get(
                `${ApiConfig.baseUrl}/tables`, config
            )

            console.log(newTables)

            setTables(newTables.data)
            
            closeModal()
        }
        catch(error){
            console.log(error)
        }
        finally{
            setLoadingCreateTable(false)
        }
    }

    const openDeleteDialog = (item: TablesResponseItem) => {
        setSelectedTable(item)
        onOpenChangeDelete()
    }

    const deleteTable = async (closeModal: () => void) => {
        setLoadingDeleteTable(true)
        const cookies = parseCookies()
        const token = cookies.accessToken
        
        try{
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            }
            const response = await axios.delete(
                `${ApiConfig.baseUrl}/tables/${selectedTable?.id}`,
                config
            )

            const newTables = await axios.get(
                `${ApiConfig.baseUrl}/tables`, config
            )

            console.log(newTables)

            setTables(newTables.data)
            
            closeModal()
        }
        catch(error){
            console.log(error)
        }
        finally{
            setLoadingDeleteTable(false)
        }
    }

    const openTable = (item: TablesResponseItem) => {
        router.push(`/tables/${item.id}`)
    }

    const exitFromApp = () => {
        localStorage.removeItem('accessToken')
        destroyCookie(null, 'accessToken')
        router.push('/')
    }

    return (
        <>
            <div className={style.main}>
                <span className='flex flex-row justify-between items-end'>
                    <p className={style.title}>Мои доски</p>
                    <Image
                        src={exit.src}
                        alt=''
                        width={20}
                        height={20}
                        className={style.exit}
                        onClick={exitFromApp}
                    />
                </span>
                <span className={style.tables}>
                    {
                        [...Array(tables.length)]
                            .map(
                                (_, index) => <Dropdown>
                                    <DropdownTrigger>
                                        <Button 
                                            key={`table-${index}`} className={style.table}
                                        >
                                            {tables[index].title}
                                            
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu onAction={(key) => {
                                        if (key == 'new'){
                                            openTable(tables[index])
                                        }
                                        else if (key == 'delete'){
                                            openDeleteDialog(tables[index])
                                        }
                                    }}>
                                        <DropdownItem key="new">Открыть</DropdownItem>
                                        <DropdownItem key="delete" className="text-danger" color="danger">Удалить</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            )
                    }
                    <Button className={style.create_table} onClick={onOpenChange}>
                        Создать доску
                    </Button>
                </span>
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
                                <ModalHeader className="flex flex-col gap-1">Введите название для новой доски</ModalHeader>
                                <ModalBody>
                                <Input
                                    ref={tableTitleRef}
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
                                        onPress={() => createTable(onClose)} 
                                        isLoading={isLoadingCreateTable}
                                    >
                                        Создать
                                    </Button>
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>

            <Modal
                isOpen={isOpenDelete}
                onOpenChange={onOpenChangeDelete}
                placement="top-center"
                backdrop={'blur'}
            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Подтвердите действие</ModalHeader>
                                <ModalBody>
                                    <p>Вы уверены, что хотите удалить таблицу: {selectedTable?.title}?</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" variant="flat" onPress={onClose}>
                                        Отмена
                                    </Button>
                                    <Button 
                                        color="danger" 
                                        onPress={() => deleteTable(onClose)} 
                                        isLoading={isLoadingDeleteTable}
                                    >
                                        Удалить
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