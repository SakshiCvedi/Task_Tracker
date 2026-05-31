export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    MEMBER = 'MEMBER,'
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    BLOCKED = 'BLOCKED',
}

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

// Shape of data we store inside the JWT token
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
    orgId: string;
}

// Extends Express's Request so every controller gets req.user typed
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}