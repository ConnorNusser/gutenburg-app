const generateUUID = (): string => {  
    const user_uuid = 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, () => {  
        const r = Math.floor(Math.random() * 16);  
        return r.toString(16);  
    });
    localStorage.setItem('user_id', user_uuid);
    return user_uuid;
}

const getUserCredentials = () => {
    const user_id = localStorage.getItem('user_id');
    if(!user_id){
        const user_id = generateUUID();
        return user_id;
    }
    return user_id
}

export { getUserCredentials };


