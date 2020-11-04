import IUploader from './IUploader'
import axios from 'axios'
import Qs from 'qs'
import UploadException from './exception/UploadException'

//未完成
class CowtransferUploader extends IUploader{

    static async upload(file,config=false) {
        // preparesend
        // https://cowtransfer.com/transfer/preparesend
        let preFormData = new FormData();
        preFormData.append("totalSize",file.size);
        preFormData.append("message","");
        preFormData.append("notifyEmail","");
        preFormData.append("validDays",7);
        preFormData.append("saveToMyCloud","false");
        preFormData.append("downloadTimes",-1);
        preFormData.append("smsReceivers","");
        preFormData.append("emailReceivers","");
        preFormData.append("enableShareToOthers","false");
        preFormData.append("language","cn");
        let preRes = await axios.post("https://cowtransfer.com/transfer/preparesend",preFormData,{
            headers: {
                'referer': 'https://cowtransfer.com/',
                'Cookie': 'grwng_uid=e8be193d-72e2-41b6-b2b5-5a3d3b80d795;'
            }
        });
        console.log(preRes);
        if (!preRes.data){
            throw new UploadException("发起请求失败");
        }
        if (preRes.data.error){
            throw new UploadException(preRes.data.error_message);
        }

        const mime = require('mime-types');

        let beforeFormData = new FormData();
        beforeFormData.append("type",mime.lookup(file.name));
        beforeFormData.append("fileId","");
        // url编码后的
        beforeFormData.append("fileName",encodeURI(file.name));
        // 中文
        beforeFormData.append("originalName",file.name);
        beforeFormData.append("fileSize",file.size);
        beforeFormData.append("transferGuid",preRes.data.transferguid);
        beforeFormData.append("storagePrefix",preRes.data.prefix);
        beforeFormData.append("unfinishPath","");
        let beforeRes = await axios.post("https://cowtransfer.com/transfer/beforeupload",beforeFormData);
        console.log(beforeRes);

        // 上传文件
        let uploadFormData = new FormData();
        uploadFormData.append("file",file);
        uploadFormData.append("token",preRes.data.uptoken);
        uploadFormData.append("key",preRes.data.prefix + '/' + preRes.data.transferguid + "/" + encodeURI(file.name));
        uploadFormData.append("fname",encodeURI(file.name));
        let uploadRes = await axios.post("https://upload.qiniup.com/",uploadFormData);
        console.log(uploadRes);
        //

        let uploadedFormData = new FormData();
        uploadedFormData.append("hash",uploadRes.data.hash);
        uploadedFormData.append("fileGuid",beforeRes.data.fileGuid);
        uploadedFormData.append("transferGuid",preRes.data.transferguid);
        let uploadedRes = await axios.post("https://cowtransfer.com/transfer/uploaded",uploadedFormData);
        console.log(uploadedRes);

        let completeFormData = new FormData();
        completeFormData.append("transferGuid",preRes.data.transferguid);
        let completeRes = await axios.post("https://cowtransfer.com/transfer/complete",uploadedFormData);
        console.log(completeRes);

        return preRes.data.uniqueurl;
    }

    static name(){
        return "奶牛快传";
    }

    static config(){
        return false;
    }
}

export default CowtransferUploader;
