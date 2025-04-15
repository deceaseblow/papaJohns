import BASE_URL from "./config.js"

// Generic function to get all items of a specific element type
const getALlElements = async (element) => {
    try{
        const res = await fetch(`${BASE_URL.GET}/${element}`)
        if(!res.ok){
            throw new Error(`Problem occured related with restApi`)
        }
        const data = await res.json()
        return data
    }catch(error){
        console.error(`error message: ${error.message}`);
    }
}

// Generic function to get element by ID
const getElementById = async (element, id) => {
    try {
        const res = await fetch(`${BASE_URL.GET}/${element}/${id}`)
        if (!res.ok) {
            throw new Error(`Problem occured related with restApi`)
        }
        const data = await res.json()        
        return data
    } catch (error) {
        console.error(`error message: ${error.message}`);
    }
}

// Generic function to delete element by ID
const deleteElementById = async (element, id) => {
    try {
        const res = await fetch(`${BASE_URL.DELETE}/${element}/${id}`, {
            method: 'DELETE'
        })
        if (!res.ok) {
            throw new Error(`Problem occured related with restApi`)
        }
        const data = await res.json()        
        return data
    } catch (error) {
        console.error(`error message: ${error.message}`);
    }
}

// Generic function to create element
const createElement = async (element, data) => {
    try {
        const res = await fetch(`${BASE_URL.POST}/${element}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            throw new Error(`Post da xetta bas verdi, status: ${res.status}`);
        }
        return res;
    } catch (error) {
        console.log(error.message);
    }
};

// Generic function to update element
const updateElement = async (element, id, data) => {
    try {
        const res = await fetch(`${BASE_URL.PUT}/${element}/${id}`, { 
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            throw new Error(`Update da xetta bas verdi, status: ${res.status}`);
        }
        return res;
    } catch (error) {
        console.log(error.message);
    }
};

// For backwards compatibility
const getAllPizzas = async () => {
    return await getALlElements('pizza');
}

const getPizzaById = async (id) => {
    return await getElementById('pizza', id);
}

const deletePizzaById = async (id) => {
    return await deleteElementById('pizza', id);
}

const createPizza = async (pizza) => {
    return await createElement('pizza', pizza);
};

const updatePizza = async (id, pizza) => {
    return await updateElement('pizza', id, pizza);
};

export {
    getALlElements,
    getElementById,
    deleteElementById,
    createElement,
    updateElement,
    
    getAllPizzas,
    getPizzaById,
    deletePizzaById,
    createPizza,
    updatePizza
}

// run 
// json-server --watch db.json