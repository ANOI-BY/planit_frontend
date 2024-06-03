import style from "@/styles/index.module.css";
import logo from "@/public/logo.png"
import { Button, Image, Input } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AuthResponse } from "@/types/auth";
import { useRouter } from "next/router";
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { ApiConfig } from "@/config/api";
import { toast, Toaster } from 'react-hot-toast';


export default function RegistrationPage() {
  const [isLoading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const passwordAgainRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const registration = async () => {
    setLoading(true)
    const username = usernameRef.current?.value
    const password = passwordRef.current?.value
    const passwordAgain = passwordAgainRef.current?.value
    const email = emailRef.current?.value

    if (email == ''){
      toast.error(
        "Поле Email не должно быть пустым!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
      setLoading(false)
      return
    }

    if (username == ''){
      toast.error(
        "Поле Username не должно быть пустым!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
      setLoading(false)
      return
    }

    if (password == ''){
      toast.error(
        "Поле Password не должно быть пустым!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
      setLoading(false)
      return
    }

    if (password != passwordAgain){
      toast.error(
        "Пароли не совпадают!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
      setLoading(false)
      return
    }

    try{
      const response = await axios.post(
        `${ApiConfig.baseUrl}/auth/register`, {
          username: username,
          password: password,
          email: email
        }
      )
      const data: AuthResponse = response.data
      localStorage.setItem('accessToken', data.token)
      setCookie(null, 'accessToken', data.token)
      router.push('/profile')
    }
    catch(error){
      toast.error(
        "Ошибка сервера!",
        {
          position: 'bottom-center',
          duration: 1000
        }
      )
    }
    finally{
      setLoading(false)
    }
    
  }

  

  useEffect(() => {
    if (localStorage.getItem('accessToken') != undefined){
      router.push('/profile')
    }
  })

  return (
    <div className={style.main}>
      <div className={style.block}>
        <span className="flex flex-row items-center justify-center">
          <Image
            className={style.logo}
            src={logo.src}
            alt=""
          />

          <p className={style.logo_text}>PlanIt</p>
        </span>
        <p className={style.sign_in_text}>Зарегистрируйтесь, чтобы продолжить</p>
        <Input 
          ref={emailRef}
          type="email" 
          label="Email" 
          variant="bordered"
          classNames={{
            base: 'mt-[20px]',
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Input 
          ref={usernameRef}
          type="text" 
          label="Username" 
          variant="bordered"
          classNames={{
            base: 'mt-[20px]',
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Input 
          ref={passwordRef}
          type="password" 
          label="Password" 
          variant="bordered"
          classNames={{
            base: 'mt-[20px]',
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Input 
          ref={passwordAgainRef}
          type="password" 
          label="Password again" 
          variant="bordered"
          classNames={{
            base: 'mt-[20px]',
            input: 'text-black',
            inputWrapper: [
              'border-2',
              'border-black',
              'group-data-[focus=true]:border-black'
            ]
          }}
        />
        <Button
          className='mt-[20px] w-full'
          isLoading={isLoading}
          onClick={registration}
        >
          Зарегистроваться
        </Button>

      </div>
      <Toaster/>
    </div>
  );
}
