import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Save profile schema in users collection.
      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role,
        profileImage: "",
        description: "",
        createdAt: serverTimestamp(),
      });

      alert("Account created!");
      if (role === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/buyer-dashboard");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box className="auth-container">
      <Paper elevation={2} className="auth-paper">
        <Typography variant="h4" component="h2" className="auth-title">Create Account</Typography>

        <Box component="form" className="auth-form" onSubmit={handleRegister}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            type="email"
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            select
            label="Role"
            value={role}
            fullWidth
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <MenuItem value="buyer">Buyer</MenuItem>
            <MenuItem value="seller">Seller</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Sign Up</Button>
          <Button type="button" variant="text" fullWidth onClick={() => navigate("/login")}>Already have an account?</Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
