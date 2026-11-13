const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });

        }


        const userRole =
            req.user.role;


        if (!userRole) {

            return res.status(403).json({
                success: false,
                message: "User role not found."
            });

        }


        if (
            !allowedRoles.includes(userRole)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to access this resource."
            });

        }


        next();

    };

};


module.exports = {
    authorizeRoles
};