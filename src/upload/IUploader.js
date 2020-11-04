import UploadException from "@/upload/exception/UploadException";
import axios from 'axios'
axios.defaults.withCredentials = false;

class IUploader{
    /**
     * 上传文件
     * @param file 文件
     * @param config 配置
     * @return {url,expire}
     */
    static upload(file,config=false){}

    /**
     * 上传组件的名称
     * @return string
     */
    static name(){}

    /**
     * 上传组件的配置
     */
    static config(){}


    static uploadStream(url,file,method='post',params={}){
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);//安字节读取文件并存储至二进制缓存区
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                let result = new Uint8Array(e.target.result);
                let res2 = await axios[method](url,result,params);
                if (res2.data.error){
                    throw new UploadException(res2.data.error.message);
                }
                resolve(res2);
            }
        })
    }
}

export default IUploader;
