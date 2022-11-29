var db = require('./databaseConfig.js')

var userDB = {
    get_actor:(actor_id,callback)=>{
        var conn = db.getConnection()
        conn.connect((err)=>{
            if (err){
                console.log(err)
                return callback(err,null)
            }else{
                const sql = "SELECT actor_id,first_name,last_name FROM actor WHERE actor_id = ?"
                conn.query(sql,[actor_id],(error,results)=>{
                    conn.end()
                    if(error){
                        return callback(error,null)
                    }else if (results.length === 0){
                        return callback (null,null)
                    }else{
                        return callback(null,results)
                    }
                })
            }
            
        })
        

    },

    get_actors:(limit,offset,callback)=>{
        var conn = db.getConnection()
        conn.connect((err)=>{
            if(err){
                console.log(err)
                return callback(err,null)
            }else{
                const sql = "SELECT actor_id,first_name,last_name FROM actor ORDER BY first_name ASC LIMIT ? OFFSET ?"
                conn.query(sql,[limit,offset],(error,results)=>{
                    conn.end()
                    if(error){
                        return callback(error,null)
                    }else{
                        return callback(null,results)
                    }
                })
            }
        })
    },

    new_actor:(actor,callback)=>{
        var conn = db.getConnection()
        conn.connect((err)=>{
            if(err){
                return callback(err,null)
            }else{
                if(!actor.first_name || !actor.last_name){
                    return callback(null,null)
                }
                const sql = `INSERT into actor (first_name,last_name) VALUES (?,?)`
                conn.query(sql,[actor.first_name,actor.last_name],(error,results)=>{
                    conn.end()
                    if(error){
                        return callback(error,null)
                    }else{
                        return callback(null,results.insertId)
                    }
                })
            }
        })
    },

    update_actor:(actor,id,callback)=>{
        var conn = db.getConnection()
        conn.connect((err)=>{
            if(err){
                return callback(err,null)
            }else{
                const sql = "UPDATE actor SET first_name = IFNull(?,first_name),last_name = IFNull(?,last_name) WHERE actor_id = ?"
                conn.query(sql,[actor.first_name,actor.last_name,id],(error,results)=>{
                    if(error){
                        return callback(error,null)
                    }else{
                        return callback(null,results)
                    }
                })
            }
        })
    },

    delete_actor:(id,callback)=>{
        var conn = db.getConnection()
        conn.connect((err)=>{
            if(err){
                return callback(err,null)
            }else{
                const sql = "DELETE FROM actor WHERE actor_id = ?"
                conn.query(sql,[id],(error,results)=>{
                    if(error){
                        return callback(error,null)
                    }else{
                        return callback(null,results.affectedRows)
                    }
                })
            }
        })
    }
}

module.exports = userDB

