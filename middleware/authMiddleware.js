// middleware/authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the next middleware or route handler
        return next();
    } else {
        // User is not authenticated, send a 401 Unauthorized response
        return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
    }
}

module.exports = { isAuthenticated };
