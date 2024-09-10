/**
 * Copyright (c) 2017 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @author baidu aip
 */

#ifndef __AIP_FACE_H__
#define __AIP_FACE_H__

#include "base/base.h"

namespace aip {

    class Face: public AipBase
    {
    public:

        std::string _faceverify =
            "https://aip.baidubce.com/rest/2.0/face/v4/faceverify";
        
        std::string _detect =
            "https://aip.baidubce.com/rest/2.0/face/v2/detect";
        
        std::string _match =
            "https://aip.baidubce.com/rest/2.0/face/v2/match";
        
        std::string _identify =
            "https://aip.baidubce.com/rest/2.0/face/v2/identify";
        
        std::string _verify =
            "https://aip.baidubce.com/rest/2.0/face/v2/verify";
        
        std::string _user_add =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/user/add";
        
        std::string _user_update =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/user/update";
        
        std::string _user_delete =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/user/delete";
        
        std::string _user_get =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/user/get";
        
        std::string _group_getlist =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/group/getlist";
        
        std::string _group_getusers =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/group/getusers";
        
        std::string _group_adduser =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/group/adduser";
        
        std::string _group_deleteuser =
            "https://aip.baidubce.com/rest/2.0/face/v2/faceset/group/deleteuser";

        std::string _face_verify_v4 =
                "https://aip.baidubce.com/rest/2.0/face/v4/mingjing/verify";

        std::string _face_match_v4 =
                "https://aip.baidubce.com/rest/2.0/face/v4/mingjing/match";

        std::string _online_picture_live_v4 = "https://aip.baidubce.com/rest/2.0/face/v4/faceverify";
        
        std::string _faceliveness_sessioncode_v1 = 
            "https://aip.baidubce.com/rest/2.0/face/v1/faceliveness/sessioncode";
        std::string _faceliveness_verify_v1 = 
            "https://aip.baidubce.com/rest/2.0/face/v1/faceliveness/verify";
        std::string _face_detect_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/detect";
        std::string _face_match_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/match";
        std::string _face_search_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/search";
        std::string _face_faceset_user_add_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add";
        std::string _face_faceset_user_update_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/update";
        std::string _face_faceset_user_delete_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/delete";
        std::string _face_faceset_user_get_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/get";
        std::string _face_faceset_group_getlist_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/getlist";
        std::string _face_faceset_group_getusers_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/getusers";
        std::string _face_faceset_user_copy_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/copy";
        std::string _face_fasetset_face_getlist_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/face/getlist";
        std::string _face_faceset_group_add_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/add";
        std::string _face_faceset_group_delete_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/group/delete";
        std::string _face_faceset_face_delete_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceset/face/delete";
        std::string _face_faceverify_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/faceverify";
        std::string _face_person_idmatch_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/person/idmatch";
        std::string _face_multi_search_v3 = 
            "https://aip.baidubce.com/rest/2.0/face/v3/multi-search";
        std::string _face_merge_v1 = 
            "https://aip.baidubce.com/rest/2.0/face/v1/merge";
        std::string _face_skin_smooth_v1 = 
            "https://aip.baidubce.com/rest/2.0/face/v1/editattr";
        std::string _face_landmark_v1 = 
            "https://aip.baidubce.com/rest/2.0/face/v1/landmark";
        std::string _face_scene_faceset_user_add = 
            "https://aip.baidubce.com/rest/2.0/face/scene/faceset/user/add";
        std::string _face_scene_faceset_user_update = 
            "https://aip.baidubce.com/rest/2.0/face/scene/faceset/user/update";
        std::string _face_scene_faceset_group_add = 
            "https://aip.baidubce.com/rest/2.0/face/scene/faceset/group/add";
        std::string _face_capture_search = 
            "https://aip.baidubce.com/rest/2.0/face/capture/search";
        std::string _face_idmatch_date_v4 = 
            "https://aip.baidubce.com/rest/2.0/face/v4/idmatch_date";
        std::string _face_verify_date_v4 = 
            "https://aip.baidubce.com/rest/2.0/face/v4/verify_date";

        Face(const std::string & app_id, const std::string & ak, const std::string & sk): AipBase(app_id, ak, sk)
        {
        }

        std::string vector_join_base64(const std::vector<std::string> & v_images) {
            std::string images;
            size_t count = v_images.size();
            for (size_t i = 0; i < count;i++)
            {
                std::string image = v_images[i];
                images += base64_encode(image.c_str(), (int) image.size());
                if (i != count) {
                    images += ",";
                }

            }
            return images;
        }
        
        /**
         * detect
         * API文档: https://ai.baidu.com/ai-doc/FACE/fk3co86lr
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * max_face_num 最多处理人脸数目，默认值1
         * face_fields 包括age,beauty,expression,faceshape,gender,glasses,landmark,race,qualities信息，逗号分隔，默认只返回人脸框、概率和旋转角度
         */
        Json::Value detect(std::string const & image, const Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_detect, data, &headers);

            return result;
        }
        
        /**
         * match
         * @param images vector多图图像文件二进制内容，vector中每一项可以使用aip::get_file_content函数获取
         * options 可选参数:
         * ext_fields 返回质量信息，取值固定:目前支持qualities(质量检测)。(对所有图片都会做改处理)
         * image_liveness 返回的活体信息，“faceliveness,faceliveness” 表示对比对的两张图片都做活体检测；“,faceliveness” 表示对第一张图片不做活体检测、第二张图做活体检测；“faceliveness,” 表示对第一张图片做活体检测、第二张图不做活体检测；<br>**注：需要用于判断活体的图片，图片中的人脸像素面积需要不小于100px\*100px，人脸长宽与图片长宽比例，不小于1/3**
         * types 请求对比的两张图片的类型，示例：“7,13”<br>**12**表示带水印证件照：一般为带水印的小图，如公安网小图<br>**7**表示生活照：通常为手机、相机拍摄的人像图片、或从网络获取的人像图片等<br>**13**表示证件照片：如拍摄的身份证、工卡、护照、学生证等证件图片，**注**：需要确保人脸部分不可太小，通常为100px\*100px
         */
        Json::Value match(
            const std::vector<std::string> & images,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["images"] = vector_join_base64(images);

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_match, null, data, null);

            return result;
        }
        
        /**
         * identify
         * @param group_id 用户组id（由数字、字母、下划线组成），长度限制128B，多个用户组id，用逗号分隔
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * ext_fields 特殊返回信息，多个用逗号分隔，取值固定: 目前支持faceliveness(活体检测)。**注：需要用于判断活体的图片，图片中的人脸像素面积需要不小于100px\*100px，人脸长宽与图片长宽比例，不小于1/3**

         * user_top_num 返回用户top数，默认为1，最多返回5个
         */
        Json::Value identify(
            std::string const & group_id,
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["group_id"] = group_id;
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_identify, null, data, null);

            return result;
        }
        
        /**
         * verify
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * @param group_id 用户组id（由数字、字母、下划线组成），长度限制128B，多个用户组id，用逗号分隔
         * options 可选参数:
         * top_num 返回用户top数，默认为1
         * ext_fields 特殊返回信息，多个用逗号分隔，取值固定: 目前支持faceliveness(活体检测)。**注：需要用于判断活体的图片，图片中的人脸像素面积需要不小于100px\*100px，人脸长宽与图片长宽比例，不小于1/3**

         */
        Json::Value verify(
            std::string const & uid,
            std::string const & image,
            std::string const & group_id,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["uid"] = uid;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["group_id"] = group_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_verify, null, data, null);

            return result;
        }
        
        /**
         * user_add
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * @param user_info 用户资料，长度限制256B
         * @param group_id 用户组id，标识一组用户（由数字、字母、下划线组成），长度限制128B。如果需要将一个uid注册到多个group下，group\_id需要用多个逗号分隔，每个group_id长度限制为48个英文字符。**注：group无需单独创建，注册用户时则会自动创建group。**<br>**产品建议**：根据您的业务需求，可以将需要注册的用户，按照业务划分，分配到不同的group下，例如按照会员手机尾号作为groupid，用于刷脸支付、会员计费消费等，这样可以尽可能控制每个group下的用户数与人脸数，提升检索的准确率
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * action_type 参数包含append、replace。**如果为“replace”，则每次注册时进行替换replace（新增或更新）操作，默认为append操作**。例如：uid在库中已经存在时，对此uid重复注册时，新注册的图片默认会**追加**到该uid下，如果手动选择`action_type:replace`，则会用新图替换库中该uid下所有图片。
         */
        Json::Value user_add(
            std::string const & uid,
            std::string const & user_info,
            std::string const & group_id,
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["uid"] = uid;
            data["user_info"] = user_info;
            data["group_id"] = group_id;
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_user_add, null, data, null);

            return result;
        }
        
        /**
         * user_update
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * @param user_info 用户资料，长度限制256B
         * @param group_id 更新指定groupid下uid对应的信息
         * options 可选参数:
         * action_type 目前仅支持replace，uid不存在时，不报错，会自动变为注册操作；未选择该参数时，如果uid不存在会提示错误
         */
        Json::Value user_update(
            std::string const & uid,
            std::string const & image,
            std::string const & user_info,
            std::string const & group_id,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["uid"] = uid;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["user_info"] = user_info;
            data["group_id"] = group_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_user_update, null, data, null);

            return result;
        }
        
        /**
         * user_delete
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * @param group_id 删除指定groupid下uid对应的信息
         * options 可选参数:
         */
        Json::Value user_delete(
            std::string const & uid,
            std::string const & group_id,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["uid"] = uid;
            data["group_id"] = group_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_user_delete, null, data, null);

            return result;
        }
        
        /**
         * user_get
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * options 可选参数:
         * group_id 选择指定group_id则只查找group列表下的uid内容，如果不指定则查找所有group下对应uid的信息
         */
        Json::Value user_get(
            std::string const & uid,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["uid"] = uid;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_user_get, null, data, null);

            return result;
        }
        
        /**
         * group_getlist
         * options 可选参数:
         * start 默认值0，起始序号
         * end 返回数量，默认值100，最大值1000
         */
        Json::Value group_getlist(
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_group_getlist, null, data, null);

            return result;
        }
        
        /**
         * group_getusers
         * @param group_id 用户组id（由数字、字母、下划线组成），长度限制128B
         * options 可选参数:
         * start 默认值0，起始序号
         * end 返回数量，默认值100，最大值1000
         */
        Json::Value group_getusers(
            std::string const & group_id,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["group_id"] = group_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_group_getusers, null, data, null);

            return result;
        }
        
        /**
         * group_adduser
         * @param group_id 用户组id（由数字、字母、下划线组成），长度限制128B，多个用户组id，用逗号分隔
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * @param src_group_id 从指定group里复制信息
         * options 可选参数:
         */
        Json::Value group_adduser(
            std::string const & group_id,
            std::string const & uid,
            std::string const & src_group_id,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["group_id"] = group_id;
            data["uid"] = uid;
            data["src_group_id"] = src_group_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_group_adduser, null, data, null);

            return result;
        }
        
        /**
         * group_deleteuser
         * @param group_id 用户组id（由数字、字母、下划线组成），长度限制128B，多个用户组id，用逗号分隔
         * @param uid 用户id（由数字、字母、下划线组成），长度限制128B
         * options 可选参数:
         */
        Json::Value group_deleteuser(
            std::string const & group_id,
            std::string const & uid,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["group_id"] = group_id;
            data["uid"] = uid;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_group_deleteuser, null, data, null);

            return result;
        }

        /**
         * 人脸 - 人脸实名认证V4
         * 基于姓名和身份证号，调取公安权威数据源人脸图，将当前获取的人脸图片，与此公安数据源人脸图进行对比，得出比对分数，并基于此进行业务判断是否为同一人
         * @param idCardNumber 身份证件号
         * @param name 姓名(需要是 utf8 编码)
         * @param image 图片信息(数据大小应小于10M 分辨率应小于1920*1080)，5.2版本SDK请求时已包含在加密数据data中，无需额外传入
         * options 可选参数:
         * quality_control 质量控制参数
         */
        Json::Value faceMingJingVerify(
            const std::string& idCardNumber,
            const std::string& name,
            std::string* image,
            std::map<std::string, std::string> options)
        {
            std::string access_token = this->getAccessToken();

            Json::Value data;
            data["id_card_number"] = idCardNumber;
            data["name"] = name;
            if (image != nullptr) {
                data["image"] = *image;
            }

            std::map< std::string,std::string >::iterator it ;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            std::string mid = "?access_token=";
            std::string url = _face_verify_v4 + mid + access_token;
            Json::Value result =
                this->request_com(url, data);

            return result;
        }

        /**
         * 人脸 - 人脸对比V4
         * 用于比对多张图片中的人脸相似度并返回两两比对的得分，可用于判断两张脸是否是同一人的可能性大小
         * @param image 图片信息(数据大小应小于10M 分辨率应小于1920*1080)，5.2版本SDK请求时已包含在加密数据data中，无需额外传入
         * @param imageType 图片类型
         * @param registerImage 图片信息(总数据大小应小于10M)，图片上传方式根据image_type来判断。本图片特指客户服务器上传图片，非加密图片Base64值
         * @param registerImageType 图片类型
         * options 可选参数
         */
        Json::Value faceMingJingMatch(
            std::string * image,
            std::string * imageType,
            const std::string& registerImage,
            const std::string& registerImageType,
            std::map<std::string, std::string>  options)
        {
            std::string access_token = this->getAccessToken();

            Json::Value data;
            if (image != nullptr) {
                data["image"] = *image;
            }
            if (imageType != nullptr) {
                data["image_type"] = *imageType;
            }
            data["register_image"] = registerImage;
            data["register_image_type"] = registerImageType;

            std::map< std::string,std::string >::iterator it ;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            std::string mid = "?access_token=";
            std::string url = _face_match_v4 + mid + access_token;
            Json::Value result =
                this->request_com(url, data);

            return result;
        }

        /**
         * 人脸 - 在线图片活体V4
         * 基于单张图片，判断图片中的人脸是否为二次翻拍
         * @param sdkVersion sdk版本
         * options 可选参数
         */
        Json::Value onlinePictureLiveV4(
            const std::string& sdkVersion,
            std::vector<std::string>& imageList,
            std::map<std::string, std::string>  options)
        {
            std::string access_token = this->getAccessToken();

            Json::Value data;
            data["sdk_version"] = sdkVersion;
            Json::Value imageListJson;
            for (std::string image : imageList) {
                imageListJson.append(image);
            }
            data["image_list"] = imageListJson;

            std::map< std::string,std::string >::iterator it ;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            std::string mid = "?access_token=";
            std::string url = _online_picture_live_v4 + mid + access_token;
            Json::Value result =
                this->request_com(url, data);

            return result;
        }

        /**
         * 随机校验码
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Ikrycq2k2
         */
        Json::Value faceliveness_sessioncode_v1(const Json::Value & options)
        {
            Json::Value data;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_faceliveness_sessioncode_v1, data, &headers);

            return result;
        }

        /**
         * H5视频活体检测
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Ikrycq2k2
         */
        Json::Value faceliveness_verify_v1(
            std::string const &video_base64,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["video_base64"] = base64_encode(video_base64.c_str(), (int) video_base64.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_faceliveness_verify_v1, null, data, null);

            return result;
        }

        /**
         * 人脸检测
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/yk37c1u4t
         */
        Json::Value face_detect_v3(
            std::string const &image,
            std::string const &image_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_detect_v3, data);
            return result;
        }

        /**
         * 人脸对比
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Lk37c1tpf
         */
        Json::Value face_match_v3(Json::Value & image_array)
        {
            Json::Value result = this->request_com(_face_match_v3, image_array);
            return result;
        }

        /**
         * 人脸搜索
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc
         */
        Json::Value face_search_v3(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id_list,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id_list"] = group_id_list;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_search_v3, data);
            return result;
        }

        /**
         * 人脸注册
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E4%BA%BA%E8%84%B8%E6%B3%A8%E5%86%8C
         */
        Json::Value face_faceset_user_add_v3(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id,
            std::string const &user_id,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id"] = group_id;
            data["user_id"] = user_id;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_faceset_user_add_v3, data);
            return result;
        }

        /**
         * 人脸更新
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E4%BA%BA%E8%84%B8%E6%9B%B4%E6%96%B0
         */
        Json::Value face_faceset_user_update_v3(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id,
            std::string const &user_id,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["image_type"] = image_type;
            data["group_id"] = group_id;
            data["user_id"] = user_id;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_faceset_user_update_v3, data);
            return result;
        }

        /**
         * 删除用户
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E5%88%A0%E9%99%A4%E7%94%A8%E6%88%B7
         */
        Json::Value face_faceset_user_delete_v3(
            std::string const &group_id,
            std::string const &user_id)
        {
            Json::Value data;
            data["group_id"] = group_id;
            data["user_id"] = user_id;

            Json::Value result = this->request_com(_face_faceset_user_delete_v3, data);
            return result;
        }

        /**
         * 用户信息查询
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%9F%A5%E8%AF%A2
         */
        Json::Value face_faceset_user_get_v3(
            std::string const &group_id,
            std::string const &user_id)
        {
            Json::Value data;
            data["group_id"] = group_id;
            data["user_id"] = user_id;

            Json::Value result = this->request_com(_face_faceset_user_get_v3, data);
            return result;
        }

        /**
         * 获取组列表
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E7%BB%84%E5%88%97%E8%A1%A8%E6%9F%A5%E8%AF%A2
         */
        Json::Value face_faceset_group_getlist_v3(uint32_t start, uint32_t length)
        {
            Json::Value data;
            data["start"] = start;
            data["length"] = length;

            Json::Value result = this->request_com(_face_faceset_group_getlist_v3, data);
            return result;
        }

        /**
         * 获取用户列表
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E5%88%97%E8%A1%A8
         */
        Json::Value face_faceset_group_getusers_v3(
            std::string const &group_id, const Json::Value & options)
        {
            Json::Value data;
            data["group_id"] = group_id;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_faceset_group_getusers_v3, data);
            return result;
        }

        /**
         * 复制用户
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E5%A4%8D%E5%88%B6%E7%94%A8%E6%88%B7
         */
        Json::Value face_faceset_user_copy_v3(
            std::string const &user_id,
            std::string const &src_group_id,
            std::string const &dst_group_id)
        {
            Json::Value data;
            data["user_id"] = user_id;
            data["src_group_id"] = src_group_id;
            data["dst_group_id"] = dst_group_id;

            Json::Value result = this->request_com(_face_faceset_user_copy_v3, data);
            return result;
        }

        /**
         * 获取用户人脸列表
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E4%BA%BA%E8%84%B8%E5%88%97%E8%A1%A8
         */
        Json::Value face_fasetset_face_getlist_v3(
            std::string const &user_id,
            std::string const &group_id)
        {
            Json::Value data;
            data["user_id"] = user_id;
            data["group_id"] = group_id;

            Json::Value result = this->request_com(_face_fasetset_face_getlist_v3, data);
            return result;
        }

        /**
         * 创建用户组
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E5%88%9B%E5%BB%BA%E7%94%A8%E6%88%B7%E7%BB%84
         */
        Json::Value face_faceset_group_add_v3(
            std::string const &group_id)
        {
            Json::Value data;
            data["group_id"] = group_id;

            Json::Value result = this->request_com(_face_faceset_group_add_v3, data);
            return result;
        }

        /**
         * 删除用户组
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E5%88%A0%E9%99%A4%E7%94%A8%E6%88%B7%E7%BB%84
         */
        Json::Value face_faceset_group_delete_v3(
            std::string const &group_id)
        {
            Json::Value data;
            data["group_id"] = group_id;

            Json::Value result = this->request_com(_face_faceset_group_delete_v3, data);
            return result;
        }

        /**
         * 删除人脸
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E4%BA%BA%E8%84%B8%E5%88%A0%E9%99%A4
         */
        Json::Value face_faceset_face_delete_v3(
            long long log_id,
            std::string const &user_id,
            std::string const &group_id,
            std::string const &face_token)
        {
            Json::Value data;
            data["log_id"] = log_id;
            data["user_id"] = user_id;
            data["group_id"] = group_id;
            data["face_token"] = face_token;

            Json::Value result = this->request_com(_face_faceset_face_delete_v3, data);
            return result;
        }

        /**
         * 在线活体检测V3
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Zk37c1urr
         */
        Json::Value face_faceverify_v3(Json::Value & image_array)
        {
            Json::Value result = this->request_com(_face_faceverify_v3, image_array);
//
//            Json::Value data;
//            data["image"] = base64_encode(image.c_str(), (int) image.size());
//            data["image_type"] = image_type;
//            merge_json(data, options);
//
//            Json::Value result = this->request_com(_face_faceverify_v3, data);
            return result;
        }

        /**
         * 身份证与名字比对
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Tkqahnjtk
         */
        Json::Value face_person_idmatch_v3(
            std::string const &id_card_number,
            std::string const &name)
        {
            Json::Value data;
            data["id_card_number"] = id_card_number;
            data["name"] = name;

            Json::Value result = this->request_com(_face_person_idmatch_v3, data);
            return result;
        }

        /**
         * 人脸搜索-M:N识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Gk37c1uzc#%E4%BA%BA%E8%84%B8%E6%90%9C%E7%B4%A2-mn-%E8%AF%86%E5%88%AB
         */
        Json::Value face_multi_search_v3(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id_list,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id_list"] = group_id_list;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_multi_search_v3, data);
            return result;
        }

        /**
         * 人脸融合
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/5k37c1ti0
         */
        Json::Value face_merge_v1(
            const Json::Value & image_template,
            const Json::Value & image_target,
            const Json::Value & options)
        {
            Json::Value data;
            data["image_template"] = image_template;
            data["image_target"] = image_target;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_merge_v1, data);
            return result;
        }

        /**
         * 人脸属性编辑
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/vk6rm5lj5
         */
        Json::Value face_skin_smooth_v1(
            std::string const &image,
            std::string const &image_type,
            std::string const &action_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["action_type"] = action_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_skin_smooth_v1, data);
            return result;
        }

        /**
         * 人脸关键点检测
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/sk8a5xewt
         */
        Json::Value face_landmark_v1(
            std::string const &image,
            std::string const &image_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_landmark_v1, data);
            return result;
        }

        /**
         * 场景化（人脸注册）
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Aknhmx6hi#%E4%BA%BA%E8%84%B8%E5%BA%93%E7%AE%A1%E7%90%86%EF%BC%88%E5%9C%BA%E6%99%AF%E5%8C%96%EF%BC%89-%E4%BA%BA%E8%84%B8%E6%B3%A8%E5%86%8C
         */
        Json::Value face_scene_faceset_user_add(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id,
            std::string const &user_id,
            std::string const &scene_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id"] = group_id;
            data["user_id"] = user_id;
            data["scene_type"] = scene_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_scene_faceset_user_add, data);
            return result;
        }

        /**
         * 场景化（人脸更新）
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Aknhmx6hi#%E4%BA%BA%E8%84%B8%E5%BA%93%E7%AE%A1%E7%90%86%EF%BC%88%E5%9C%BA%E6%99%AF%E5%8C%96%EF%BC%89-%E4%BA%BA%E8%84%B8%E6%9B%B4%E6%96%B0
         */
        Json::Value face_scene_faceset_user_update(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id,
            std::string const &user_id,
            std::string const &scene_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id"] = group_id;
            data["user_id"] = user_id;
            data["scene_type"] = scene_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_scene_faceset_user_update, data);
            return result;
        }

        /**
         * 场景化（创建用户组）
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Aknhmx6hi#%E4%BA%BA%E8%84%B8%E5%BA%93%E7%AE%A1%E7%90%86%EF%BC%88%E5%9C%BA%E6%99%AF%E5%8C%96%EF%BC%89-%E5%88%9B%E5%BB%BA%E7%94%A8%E6%88%B7%E7%BB%84
         */
        Json::Value face_scene_faceset_group_add(
            std::string const &group_id,
            std::string const &scene_type)
        {
            Json::Value data;
            data["group_id"] = group_id;
            data["scene_type"] = scene_type;

            Json::Value result = this->request_com(_face_scene_faceset_group_add, data);
            return result;
        }

        /**
         * 人脸搜索（视频监控）
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/Aknhmx6hi
         */
        Json::Value face_capture_search(
            std::string const &image,
            std::string const &image_type,
            std::string const &group_id_list,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = image;
            data["image_type"] = image_type;
            data["group_id_list"] = group_id_list;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_capture_search, data);
            return result;
        }

        /**
         * 身份证信息及有效期核验接口
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/elav5puig
         */
        Json::Value face_idmatch_date_v4(
            std::string const &name,
            std::string const &id_card_number,
            std::string const &start_date,
            std::string const &end_date)
        {
            Json::Value data;
            data["name"] = name;
            data["id_card_number"] = id_card_number;
            data["start_date"] = start_date;
            data["end_date"] = end_date;

            Json::Value result = this->request_com(_face_idmatch_date_v4, data);
            return result;
        }

        /**
         * 人脸实名信息及有效期核验
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/FACE/qlav5rwms
         */
        Json::Value face_verify_date_v4(
            std::string const &name,
            std::string const &id_card_number,
            std::string const &start_date,
            std::string const &end_date,
            std::string const &image,
            std::string const &image_type,
            const Json::Value & options)
        {
            Json::Value data;
            data["name"] = name;
            data["id_card_number"] = id_card_number;
            data["start_date"] = start_date;
            data["end_date"] = end_date;
            data["image"] = image;
            data["image_type"] = image_type;
            merge_json(data, options);

            Json::Value result = this->request_com(_face_verify_date_v4, data);
            return result;
        }
    };
}
#endif
