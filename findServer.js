const request = require('request'); // http package for requests
const message = require('./message_template');

/* 
    findserver.js contains all the logical calcultations to check whether server is offline or 
    online and that am checking on this basis :
    0 : offline, 1 : online
 */

class Server{
    /* findserver with least priority */
    static findServer(server_list){
        let promises = [];
        return new Promise((resolve, reject)=>{
            server_list.map((v) => {
                promises.push(Server.status(v)); // list of all promises
            });
            // resolve all promises
            Promise.all(promises)    
                .then(async (data)=> {
                    // sort online servers with priority and status
                    let sortedArr = Server.sort_online_servers(data); 

                    /* check if all servers are online */
                    let ifAllServerOffline = false;
                    try{
                        ifAllServerOffline =  await Server.checkIfAllServerOffline(data);
                    }
                    catch(err){ reject(message.general_error) }
                    /* end */
                    // if all servers are offline then reject the promise
                    if(ifAllServerOffline) reject(message.offline);
                    let leastPriorityOnlineServer = sortedArr[0];
                    // return online server with least priority
                    resolve(leastPriorityOnlineServer) 
                })
                .catch((err)=> reject(err)); // reject if any error
        })
    }

    /* check status of each server */
    static status(v){
        return new Promise((resolve, reject)=>{
            request(v.url, function (error, response, body) { //requst package to trigger get url
                /* throw error if server not found and treat it as offline */
                if(error){
                    v.status = 0;
                    resolve(v);
                    return false;
                }
                if(response.statusCode == 200 || response.statusCode == 299) v.status = 1;
                else v.status = 0;
                resolve(v);
            });
        })
    }

    /* sort all servers on the basis of priority and online status */
    static sort_online_servers(serverList){
        return serverList.sort((a,b)=>{
            if(a.priority > b.priority){
                if(a.status == 1 && b.status == 1) return 1;
                else return -1;
            }
            if(a.priority < b.priority) return -1;
        })
    }

    /* check if all servers are offline */
    static checkIfAllServerOffline(serverList){
        return new Promise((resolve, reject)=>{
            let server_status = serverList.some((v)=>{
                if(v.status == 1) return v;
            })
            resolve(!server_status);
        })
    }
}

module.exports = Server;