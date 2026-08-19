
export const useCollection = async(collectioname, page, limit, search) => {
const [isLoading, setIsLoading] = useState(true);
const create=  (data)=>{
    try{
        setIsLoading(true);
        const res = await api.post(`/${collectioname}`, data);
          if(res.data?.success){
            return res.data?.result;
          }
     
    }catch(error){
        console.log(error);
    }finally{
        setIsLoading(false);
    }
}
return {isLoading,create};
}