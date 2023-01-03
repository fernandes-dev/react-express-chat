import './App.css'
import {useState} from "react";
import io from 'socket.io-client'

interface IUser {
  id: string
  name: string
}

interface IMessage {
  id: string
  author: string
  text: string
}

function App() {
  const [user, setUser] = useState<IUser>({name: '', id: ''})
  const [signed, setSigned] = useState(false)
  const [message, setMessage] = useState('')

  const [messages, setMessages] = useState<IMessage[]>([])

  const [socket, setSocket] = useState<any>()


  function sendMessage() {
    setMessages(prev => {
        return [...prev, {author: user.name, text: message, id: Math.random().toString()}]
      }
    )

    socket.emit('message', message)
  }

  function connectToServer() {
    const socket = io("ws://localhost:3333", {
      reconnectionDelayMax: 10000,
      auth: {
        token: user.name
      },
      query: {
        "name": user.name
      },
    });


    socket.on('message', (message) => {
      setMessages(prev => {
        return [...prev, message]
      })
    })

    socket.on('connect', () => {
      socket.emit('login', {...user, id: socket.id})
    })

    setSocket(socket)
    setUser({...user, id: socket.id})
  }

  function login() {
    if (user.name.trim().length > 0) {
      setSigned(true)
      setUser({...user, id: ''})
      connectToServer()
    }
  }

  return (
    <div>
      {signed ? <span>Olá {user.name}</span> : <div>
        <span>Digite seu nome</span>
        <input type="text" onChange={(v) => setUser({name: v.target.value, id: user.id})}/>
        <button onClick={login}>
          Entrar
        </button>
      </div>}
      {signed && <div>
        <div id='messages'>
          {messages.map((message) => {
            return <div key={message.id}>
              {message.author !== user.name ?
                <div className={'other-message'}>
                  <span>{message.author} -- </span>
                  <span>{message.text}</span>
                  <br/>
                </div> :
                <div className={'my-message'}>
                  <span>{message.author} -- </span>
                  <span>{message.text}</span>
                  <br/>
                </div>
              }
            </div>
          })}
        </div>
        <div id='message-input'>
          <label htmlFor="my-message">Digite sua mensagem:</label>
          <input onChange={(e) => setMessage(e.target.value)} id='my-message' type="text"/>
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </div>}
    </div>
  )
}

export default App
