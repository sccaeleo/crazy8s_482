import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditAccount() {
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

  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    axios
      .post(`/edit_account/${id}`, data[0])
      .then((res) => {
        navigate("/");
        console.log(res);
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="container-fluid vw-100 vh-100 bg-success">
      <h1>User {id}</h1>
      <Link to="/" className="btn btn-success">
        Back
      </Link>
      {data.map((account) => {
        return (
          <form onSubmit={handleSubmit}>
            <div className="form-group my-3">
              <label htmlFor="name">Name</label>
              <input
                value={account.name}
                type="text"
                name="name"
                required
                onChange={(e) =>
                  setData([{ ...data[0], name: e.target.value }])
                }
              />
            </div>
            <div className="form-group my-3">
              <label htmlFor="email">Email</label>
              <input
                value={account.email}
                type="email"
                name="email"
                required
                onChange={(e) =>
                  setData([{ ...data[0], email: e.target.value }])
                }
              />
            </div>
            <div className="form-group my-3">
              <label htmlFor="password">Password</label>
              <input
                value={account.password}
                type="text"
                name="password"
                required
                onChange={(e) =>
                  setData([{ ...data[0], password: e.target.value }])
                }
              />
            </div>
            <div className="form-group my-3">
              <button type="submit" className="btn btn-success">
                Save
              </button>
            </div>
          </form>
        );
      })}
    </div>
  );
}

export default EditAccount;