import React, { useState } from 'react'
import axios from 'axios'
import {Link, useNavigate} from 'react-router-dom'

function CreateAccount() {
    const [values, setValues] = useState({
        name: '',
        email: '',
        password: ''
    })

    const navigate = useNavigate()

    /**
     * Create an account with filled form
     * @param {*} e - form data
     */
    function handleSubmit(e){
        e.preventDefault()

        console.log(values)

        axios.post('/add_user', values)
        .then((res)=>{
            
            navigate('/')
            console.log(res)
        })
        .catch((err)=>console.log(err))
    }
  return (
    <div className='container vh-100 vw-100 bg-success'>
        <div className='row'>
            <div className='d-flex justify-content-end'>
                <Link to='/' class='btn btn-success'>Home</Link>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='form-group my-3'>
                    <label htmlFor='name'>Name</label>
                    <input id='name' type='text' name='name' required onChange={(e)=> setValues({...values, name: e.target.value})} />
                </div>
                <div className='form-group my-3'>
                    <label htmlFor='email'>Email</label>
                    <input id='email'type='email' name='email' required onChange={(e)=> setValues({...values, email: e.target.value})} />
                </div>
                <div className='form-group my-3'>
                    <label htmlFor='password'>Password</label>
                    <input id='password'type='text' name='password' required onChange={(e)=> setValues({...values, password: e.target.value})} />
                </div>
                <div className='form-group my-3'>
                    <button type='submit' className='btn btn-success'>Save</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default CreateAccount