import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";

function AccountSettings() {
  const [data, setData] = useState([])
  const [deleted, setDeleted] = useState(true)
  useEffect(()=>{
      if(deleted){
          setDeleted(false)
      axios.get('/accounts')
      .then((res)=>{
          setData(res.data)
      })
      .catch((err)=>console.log(err))
  }
  }, [deleted])

  function handleDelete(id){
      axios.delete(`/delete_user/${id}`)
      .then((res)=>{
          setDeleted(true)
      })
      .catch((err)=> console.log(err))
  }
return (
  <div className='container-fluid bg-success vh-100 vw-100'>
      <h3>Accounts</h3>
      <div className='d-flex justify-content-end'>
          <Link className='btn btn-light' to='/CreateAccount'>Add Account</Link>
      </div>
      <table>
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {
                  data.map((account)=>{
                      return (<tr>
                          <td>{account.id}</td>
                          <td>{account.name}</td>
                          <td>{account.email}</td>
                          <td>{account.password}</td>
                          <td>
                              <Link className='btn mx-2 btn-light' to={`/viewaccount/${account.id}`}>View</Link>
                              <Link className='btn mx-2 btn-light' to={`/editaccount/${account.id}`}>Edit</Link>
                              <button onClick={()=>handleDelete(account.id)} className='btn mx-2 btn-danger'>Delete</button>
                          </td>
                      </tr>)
                  })
              }
          </tbody>
      </table>
  </div>
)
}

export default AccountSettings