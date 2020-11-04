import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

class FtpodUploader extends IUploader{

    static async upload(file,config=false) {
        // 先获取上传地址
        // https://ftpod.cn/uploadSession?fileName=中奖楼层+.rar&fileSize=434&validDays=7&allowDownloadsNum=0
        let res = await axios.get("https://ftpod.cn/uploadSession?fileName=" + file.name + "&fileSize=" + file.size + "&validDays=7&allowDownloadsNum=0");
        console.log(res);


        // 上传文件
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);//安字节读取文件并存储至二进制缓存区
        return new Promise((resolve, reject) => {
            reader.onload = async function (e) {
                console.log(e,reader.result);
                let result = new Uint8Array(e.target.result);
                let res2 = await axios.put(res.data.uploadUrl,result,{
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Range': 'bytes 0-' + file.size + '/' + file.size
                    }
                });
                if (res2.data.error){
                    throw new UploadException(res2.data.error.message);
                }
                // console.log(res2);
                resolve()
            }
        })
    }

    static name(){
        return "ftpod";
    }

    static config(){
        return false;
    }
}

export default FtpodUploader;
