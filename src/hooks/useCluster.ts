/*
 * @Author: yongju
 * @Date: 2021-07-08 21:12:56
 * @LastEditors: yongju
 * @LastEditTime: 2021-07-08 23:26:46
 * @Description: 
 */

import { parseClusterConfig } from "../layers/ClusterLayer";
import { useEffect,useState,useRef } from "react";

export function useCluster(clusterLayers:any,map:any, setViewState:any){
    
    const destroyedRef = useRef(false);

    const [style ,setStyle] = useState({
        layers:[],
        sources:{}
    });
    
    useEffect(() => {
        if(map){
            window.map = map;
            let layers:any = [];
            let sources = {};
            let promiseAll = []
            for(let i = 0 ; i < clusterLayers.length ; i += 1){
                promiseAll.push(new Promise((resolve,reject)=>{
                    parseClusterConfig(clusterLayers[i],map,setViewState).then((layer)=>{
                        resolve(layer);
                    });
                }));
            }
            Promise.all(promiseAll).then((results:any = [])=>{
                for(let i = 0 ; i < results.length ; i ++){
                    layers.push(...results[i].layers);
                    sources = {
                        ...sources,
                        ...results[i].sources
                    }
                }
                //if(!destroyedRef.current){
                    setStyle({
                        sources,
                        layers
                    });
                //}
            });
        }
        return ()=>{
            destroyedRef.current = true;
        }
    }, [clusterLayers,map,setViewState]);
    
    return [style];
}