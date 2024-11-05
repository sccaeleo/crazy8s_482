import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ViewAccount() {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/get_user/${id}`);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid vw-100 vh-100 bg-success">
      <h1>User {id}</h1>
      <Link to="/accountsettings" className="btn btn-success">
        Back
      </Link>
      <ul className="list-group">
        <li className="list-group-item">
          <b>Name: </b>
          {user.name}
        </li>
        <li className="list-group-item">
          <b>Email: </b>
          {user.email}
        </li>
      </ul>
    </div>
  );
}

export default ViewAccount;