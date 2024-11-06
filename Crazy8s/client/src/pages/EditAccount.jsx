import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function EditAccount() {
    const [user, setUser] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

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

    /**
     * Update the edited account
     * @param {*} e - form to be submitted
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/edit_user/${id}`, {
                name: user.name,
                email: user.email,
                password: user.password
            });
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-fluid vw-100 vh-100 bg-success">
            <h1>User {id}</h1>
            <Link to="/" className="btn btn-success">
                Back
            </Link>
            <form onSubmit={handleSubmit}>
                <div className="form-group my-3">
                    <label htmlFor="name">Name</label>
                    <input
                        value={user.name}
                        type="text"
                        name="name"
                        required
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                </div>
                <div className="form-group my-3">
                    <label htmlFor="email">Email</label>
                    <input
                        value={user.email}
                        type="email"
                        name="email"
                        required
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </div>
                <div className="form-group my-3">
                    <label htmlFor="password">Password</label>
                    <input
                        value={user.password}
                        type="text"
                        name="password"
                        required
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                    />
                </div>
                <div className="form-group my-3">
                    <button type="submit" className="btn btn-success">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditAccount;