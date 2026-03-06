import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", credential.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : "buyer";

      alert("Login successful!");

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
        <Typography variant="h4" component="h2" className="auth-title">Login</Typography>

        <Box component="form" className="auth-form" onSubmit={handleLogin}>
          <TextField
            type="email"
            label="Email"
            variant="outlined"
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            type="password"
            label="Password"
            variant="outlined"
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 1 }}>Login</Button>
          <Button type="button" variant="text" fullWidth onClick={() => navigate("/signup")}>Create account</Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
