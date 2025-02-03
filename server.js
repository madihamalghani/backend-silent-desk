import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({ path: './config/config.env' });

console.log("Loaded PORT:", process.env.PORT); // Debugging line

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
