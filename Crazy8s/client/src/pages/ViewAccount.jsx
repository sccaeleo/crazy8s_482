import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ViewAccount() {
console.log("here")
  const [data, setData] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    axios
      .get(`/get_account/${id}`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  }, [id]);
  return (
    <div className="container-fluid vw-100 vh-100 bg-success">
      <h1>User {id}</h1>
      <Link to="/accountsettings" className="btn btn-success">Back</Link>
      {data.map((account) => {
        return (
          <ul className="list-group">
            <li className="list-group-item">
              <b>ID: </b>
              {account["id"]}
            </li>
            <li className="list-group-item">
              <b>Name: </b>
              {account["name"]}
            </li>
            <li className="list-group-item">
              <b>Email: </b>
              {account["email"]}
            </li>
          </ul>
        );
      })}
    </div>
  );
}

export default ViewAccount;