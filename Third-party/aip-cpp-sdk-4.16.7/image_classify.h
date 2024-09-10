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

#ifndef __AIP_IMAGECLASSIFY_H__
#define __AIP_IMAGECLASSIFY_H__

#include "base/base.h"
#include <json/json.h>

namespace aip {

    class Imageclassify : public AipBase {
    public:

        std::string _traffic_flow =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/traffic_flow";

        std::string _vehicle_damage =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/vehicle_damage";

        std::string _vehicle_seg =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/vehicle_seg";

        std::string _vehicle_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/vehicle_detect";

        std::string _vehicle_detect_high =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/vehicle_detect_high";

        std::string _vehicle_attr =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/vehicle_attr";

        std::string _redwine =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/redwine";

        std::string _currency =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/currency";

        std::string _dishadd =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/dish/add";

        std::string _combination =
                "https://aip.baidubce.com/api/v1/solution/direct/imagerecognition/combination";

        std::string _dishDelete =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/dish/delete";

        std::string _ingredient =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/classify/ingredient";

        std::string _dishSearch =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/dish/search";

        std::string _mult_object_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/multi_object_detect";

        std::string _dish_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v2/dish";

        std::string _car_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/car";

        std::string _logo_search =
                "https://aip.baidubce.com/rest/2.0/image-classify/v2/logo";

        std::string _logo_add =
                "https://aip.baidubce.com/rest/2.0/realtime_search/v1/logo/add";

        std::string _logo_delete =
                "https://aip.baidubce.com/rest/2.0/realtime_search/v1/logo/delete";

        std::string _animal_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/animal";

        std::string _plant_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/plant";

        std::string _object_detect =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/object_detect";

        std::string _advanced_general =
                "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general";

        std::string _landmark_v1 =
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/landmark";

        std::string _redwine_add_v1 = 
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/redwine/add";
        std::string _redwine_search_v1 = 
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/redwine/search";
        std::string _redwine_delete_v1 = 
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/redwine/delete";
        std::string _redwine_update_v1 = 
                "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/redwine/update";
        std::string _vehicle_attr_classify_v2 = 
                "https://aip.baidubce.com/rest/2.0/image-classify/v2/vehicle_attr";

        Imageclassify(const std::string &app_id, const std::string &ak, const std::string &sk) : AipBase(app_id, ak,
                                                                                                         sk) {
        }

        /**
         * dish_detect
         * 该请求用于菜品识别。即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片的菜品名称、卡路里信息、置信度。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * top_num 返回预测得分top结果数，默认为5
         */
        Json::Value dish_detect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_dish_detect, null, data, null);

            return result;
        }

        /**
         * car_detect
         * 该请求用于检测一张车辆图片的具体车型。即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片的车辆品牌及型号。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * top_num 返回预测得分top结果数，默认为5
         */
        Json::Value car_detect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_car_detect, null, data, null);

            return result;
        }

        /**
         * logo_search
         * 该请求用于检测和识别图片中的品牌LOGO信息。即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中LOGO的名称、位置和置信度。 当效果欠佳时，可以建立子库（请加入QQ群：649285136 联系工作人员申请建库）并自定义logo入库，提高识别效果。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * custom_lib 是否只使用自定义logo库的结果，默认false：返回自定义库+默认库的识别结果
         */
        Json::Value logo_search(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_logo_search, null, data, null);

            return result;
        }

        /**
         * logo_add
         * 该接口尚在邀测阶段，使用该接口之前需要线下联系工作人员完成建库方可使用，请加入QQ群：649285136 联系相关人员。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * @param brief brief，检索时带回。此处要传对应的name与code字段，name长度小于100B，code长度小于150B
         * options 可选参数:
         */
        Json::Value logo_add(
                std::string const &image,
                std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_logo_add, null, data, null);

            return result;
        }

        /**
         * logo_delete_by_image
         * 该接口尚在邀测阶段，使用该接口之前需要线下联系工作人员完成建库方可使用，请加入QQ群：649285136 联系相关人员。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value logo_delete_by_image(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_logo_delete, null, data, null);

            return result;
        }

        /**
         * logo_delete_by_sign
         * 该接口尚在邀测阶段，使用该接口之前需要线下联系工作人员完成建库方可使用，请加入QQ群：649285136 联系相关人员。
         * @param cont_sign 图片签名（和image二选一，image优先级更高）
         * options 可选参数:
         */
        Json::Value logo_delete_by_sign(
                std::string const &cont_sign,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_logo_delete, null, data, null);

            return result;
        }

        /**
         * animal_detect
         * 该请求用于识别一张图片。即对于输入的一张图片（可正常解码，且长宽比适宜），输出动物识别结果
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * top_num 返回预测得分top结果数，默认为6
         */
        Json::Value animal_detect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_animal_detect, null, data, null);

            return result;
        }

        /**
         * plant_detect
         * 该请求用于识别一张图片。即对于输入的一张图片（可正常解码，且长宽比适宜），输出植物识别结果。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value plant_detect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_plant_detect, null, data, null);

            return result;
        }

        /**
         * object_detect
         * 用户向服务请求检测图像中的主体位置。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * with_face 如果检测主体是人，主体区域是否带上人脸部分，0-不带人脸区域，其他-带人脸区域，裁剪类需求推荐带人脸，检索/识别类需求推荐不带人脸。默认取1，带人脸。
         */
        Json::Value object_detect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_object_detect, null, data, null);

            return result;
        }


        /**
         * 图像多主体检测
         * 检测出图片中多个主体，并给出位置、标签和置信得分。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value multobjectdetect(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_mult_object_detect, null, data, null);

            return result;
        }

        /**
         * 自定义菜单识别检索
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value dishsearch(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_dishSearch, null, data, null);

            return result;
        }

        /**
         * 果蔬识别
         * 该请求用于识别果蔬类食材，即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中的果蔬食材结果。
         * @param image 二进制图像数据
         * options 可选参数:
         * topNum 返回预测得分top结果数，如果为空或小于等于0默认为5；如果大于20默认20
         */
        Json::Value ingredient(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_ingredient, null, data, null);

            return result;
        }

        /**
         * 自定义菜单识别删除
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value dishdeletebyimage(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_dishDelete, null, data, null);

            return result;
        }

        /**
         * 组合接口
         * 同时调用多个模型服务。支持图像识别的多个接口
         * @param image 二进制图像数据
         * @param scenes 本次调用的模型服务,数组表示
         * options 可选参数:
         * sceneConf 对特定服务，支持的个性化参数，若不填则使用默认设置
         */
        Json::Value combination(std::string const &image,
                                Json::Value const &scenes,
                                Json::Value const &options) {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["scenes"] = scenes;
            merge_json(data, options);

            Json::Value result = this->request_com(_combination, data);
            return result;
        }

        /**
         * 自定义菜单识别删除
         * 入库菜品图片的删除操作
         * @param contSign 图片签名
         * options 可选参数:
         */
        Json::Value dishdeletebycontsign(
                std::string const &contSign,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["contSign"] = contSign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_dishDelete, null, data, null);

            return result;
        }

        /**
         * 自定义菜单识别
         * 该接口实现单张菜品图片入库，入库时需要同步提交图片及可关联至本地菜品图库的摘要信息（具体变量为brief，brief可传入图片在本地标记id、图片url、图片名称等）
         * @param image 二进制图像数据
         * @param brief 菜品名称摘要信息，检索时带回，不超过256B
         * options 可选参数:
         */
        Json::Value dishadd(
                std::string const &image,
                std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_dishadd, null, data, null);

            return result;
        }

        /**红酒识别
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value redwine(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_redwine, null, data, null);

            return result;
        }

        /**红酒识别
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value redwineUrl(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_redwine, null, data, null);

            return result;
        }

        /**货币识别
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value currency(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_currency, null, data, null);

            return result;
        }

        /**货币识别
         * 在已自建菜品库并入库的情况下，该接口实现单菜品/多菜品的识别。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value currencyUrl(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_currency, null, data, null);

            return result;
        }

        /**
         * 组合接口
         * 同时调用多个模型服务。支持图像识别的多个接口
         * @param image 二进制图像数据
         * @param scenes 本次调用的模型服务,数组表示
         * options 可选参数:
         * sceneConf 对特定服务，支持的个性化参数，若不填则使用默认设置
         */
        Json::Value combinationUrl(std::string const &imgUrl,
                                Json::Value const &scenes,
                                Json::Value const &options) {
            Json::Value data;
            data["imgUrl"] = imgUrl;
            data["scenes"] = scenes;
            merge_json(data, options);

            Json::Value result = this->request_com(_combination, data);
            return result;
        }

        /**
         * 车辆属性识别
         * 传入单帧图像，检测图片中所有车辆，返回每辆车的类型和坐标位置，可识别小汽车、卡车、巴士、摩托车、三轮车、自行车6大类车辆，
         * @param image 二进制图像数据
         * options 可选参数:
         * type 是否选定某些属性输出对应的信息，可从12种输出属性中任选若干，用英文逗号分隔（例如vehicle_type,roof_rack,skylight）。默认输出全部属性
         */
        Json::Value vehicleAttr(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_attr, null, data, null);
            return result;
        }

        /**
         * 车辆属性识别
         * 传入单帧图像，检测图片中所有车辆，返回每辆车的类型和坐标位置，可识别小汽车、卡车、巴士、摩托车、三轮车、自行车6大类车辆，
         * @param url 图片完整URL
         * options 可选参数:
         * type 是否选定某些属性输出对应的信息，可从12种输出属性中任选若干，用英文逗号分隔（例如vehicle_type,roof_rack,skylight）。默认输出全部属性
         */
        Json::Value vehicleAttrUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_attr, null, data, null);
            return result;
        }

        /**
         * 车辆检测-高空版
         * 面向高空拍摄视角（30米以上），传入单帧图像，检测图片中所有车辆，返回每辆车的坐标位置（不区分车辆类型），并进行车辆计数，支持指定矩形区域的车辆检测与数量统计。
         * @param image 二进制图像数据
         * options 可选参数:
         * area 只统计该矩形区域内的车辆数，缺省时为全图统计。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合矩形区域。
         */
        Json::Value vehicleDetectHigh(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_detect_high, null, data, null);
            return result;
        }

        /**
         * 车辆检测-高空版
         * 面向高空拍摄视角（30米以上），传入单帧图像，检测图片中所有车辆，返回每辆车的坐标位置（不区分车辆类型），并进行车辆计数，支持指定矩形区域的车辆检测与数量统计。
         * @param url 图片完整URL
         * options 可选参数:
         * area 只统计该矩形区域内的车辆数，缺省时为全图统计。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合矩形区域。
         */
        Json::Value vehicleDetectHighUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_detect_high, null, data, null);
            return result;
        }

        /**
         * 车型识别
         * 识别图片中车辆的具体车型，可识别常见的3000+款车型（小汽车为主），输出车辆的品牌型号、颜色、年份、位置信息；支持返回对应识别结果的百度百科词条信息，包含词条名称、百科页面链接、百科图片链接、百科内容简介。
         * @param image 二进制图像数据
         * options 可选参数:
         * top_num 返回结果top n，默认5。e         * baike_num 返回百科信息的结果数，默认不返回
         */
        Json::Value carDetect(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_car_detect, null, data, null);
            return result;
        }

        /**
         * 车型识别
         * 识别图片中车辆的具体车型，可识别常见的3000+款车型（小汽车为主），输出车辆的品牌型号、颜色、年份、位置信息；支持返回对应识别结果的百度百科词条信息，包含词条名称、百科页面链接、百科图片链接、百科内容简介。
         * @param url 图片完整URL
         * options 可选参数:
         * top_num 返回结果top n，默认5。e         * baike_num 返回百科信息的结果数，默认不返回
         */
        Json::Value carDetectUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_car_detect, null, data, null);
            return result;
        }

        /**
         * 车辆检测
         * 入单帧图像，检测图片中所有机动车辆，返回每辆车的类型和坐标位置，可识别小汽车、卡车、巴士、摩托车、三轮车5类车辆，并对每类车辆分别计数，同时可定位小汽车、卡车、巴士的车牌位置，支持指定矩形区域的车辆检测与数量统计
         * @param image 二进制图像数据
         * options 可选参数:
         * area 只统计该矩形区域内的车辆数，缺省时为全图统计。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合矩形区域。
         */
        Json::Value vehicleDetect(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_detect, null, data, null);
            return result;
        }

        /**
         * 车辆检测
         * 入单帧图像，检测图片中所有机动车辆，返回每辆车的类型和坐标位置，可识别小汽车、卡车、巴士、摩托车、三轮车5类车辆，并对每类车辆分别计数，同时可定位小汽车、卡车、巴士的车牌位置，支持指定矩形区域的车辆检测与数量统计
         * @param url 图片完整URL
         * options 可选参数:
         * area 只统计该矩形区域内的车辆数，缺省时为全图统计。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合矩形区域。
         */
        Json::Value vehicleDetectUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_detect, null, data, null);
            return result;
        }

        /**
         * 车辆分割
         * 传入单帧图像，检测图像中的车辆，以小汽车为主，识别车辆的轮廓范围，与背景进行分离，返回分割后的二值图、灰度图，支持多个车辆、车门打开、后备箱打开、机盖打开、正面、侧面、背面等各种拍摄场景。
         * @param image 二进制图像数据
         * options 可选参数:
         * type 可以通过设置type参数，自主设置返回哪些结果图，避免造成带宽的浪费。1）可选值说明：labelmap - 二值图像，需二次处理方能查看分割效果scoremap - 车辆前景灰度图2）type 参数值可以是可选值的组合，用逗号分隔；如果无此参数默认输出全部3类结果图
         */
        Json::Value vehicleSeg(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_seg, null, data, null);
            return result;
        }

        /**
         * 车辆外观损伤识别
         * 针对常见的小汽车车型，识别车辆外观受损部件及损伤类型，支持32种车辆部件、5大类外观损伤。同时可输出损伤的数值化结果（长宽、面积、部件占比），支持单图多种损伤的识别。
         * @param image 二进制图像数据
         * options 可选参数:

         */
        Json::Value vehicleDamage(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_damage, null, data, null);
            return result;
        }

        /**
         * 车流统计
         * 根据传入的连续视频图片序列，进行车辆检测和追踪，返回每个车辆的坐标位置、车辆类型（包括小汽车、卡车、巴士、摩托车、三轮车5类）。
         * 在原图中指定区域，根据车辆轨迹判断驶入/驶出区域的行为，统计各类车辆的区域进出车流量，可返回含统计值和跟踪框的渲染图。
         * @param image 二进制图像数据         * @param case_id 任务ID（通过case_id区分不同视频流，自拟，不同序列间不可重复）
         * @param case_init 每个case的初始化信号，为true时对该case下的跟踪算法进行初始化，为false时重载该case的跟踪状态。
         * 当为false且读取不到相应case的信息时，直接重新初始化
         * @param area 只统计进出该区域的车辆。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标
         * （默认尾点和首点相连），形成闭合多边形区域。
         * options 可选参数:
         * show 是否返回结果图（含统计值和跟踪框）。选true时返回渲染后的图片(base64)，其它无效值或为空则默认false。
         */
        Json::Value trafficFlow(
                std::string image,
                int case_id,
                std::string case_init,
                std::string area,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["case_id"] = case_id;
            data["case_init"] = case_init;
            data["area"] = area;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_traffic_flow, null, data, null);
            return result;
        }

        /**
         * 车流统计
         * 根据传入的连续视频图片序列，进行车辆检测和追踪，返回每个车辆的坐标位置、车辆类型（包括小汽车、卡车、巴士、摩托车、三轮车5类）。在原图中指定区域，根据车辆轨迹判断驶入/驶出区域的行为，统计各类车辆的区域进出车流量，可返回含统计值和跟踪框的渲染图。
         * @param url 图片完整URL         * @param case_id 任务ID（通过case_id区分不同视频流，自拟，不同序列间不可重复）         * @param case_init 每个case的初始化信号，为true时对该case下的跟踪算法进行初始化，为false时重载该case的跟踪状态。当为false且读取不到相应case的信息时，直接重新初始化         * @param area 只统计进出该区域的车辆。逗号分隔，如‘x1,y1,x2,y2,x3,y3...xn,yn'，按顺序依次给出每个顶点的x、y坐标（默认尾点和首点相连），形成闭合多边形区域。
         * options 可选参数:
         * show 是否返回结果图（含统计值和跟踪框）。选true时返回渲染后的图片(base64)，其它无效值或为空则默认false。
         */
        Json::Value trafficFlowUrl(
                std::string url,
                int case_id,
                std::string case_init,
                std::string area,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            data["case_id"] = case_id;
            data["case_init"] = case_init;
            data["area"] = area;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_traffic_flow, null, data, null);
            return result;
        }


        /**
        * 通用物体识别
        * 该请求用于通用物体及场景识别，即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中的多个物体及场景标签。
        * @param image 二进制图像数据
        * options 可选参数:
        * baike_num  返回百科信息的结果数，默认不返回
        */
        Json::Value advancedGeneral(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_advanced_general, null, data, null);
            return result;
        }

        /**
        * 通用物体识别
        * 该请求用于通用物体及场景识别，即对于输入的一张图片（可正常解码，且长宽比适宜），输出图片中的多个物体及场景标签。
        * @param url 图片完整URL
        * options 可选参数:
        * baike_num  返回百科信息的结果数，默认不返回
        */
        Json::Value advancedGeneralUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_advanced_general, null, data, null);
            return result;
        }

        /**
        * 地标识别
        * @param image 二进制图像数据
        * options 可选参数:
        * baike_num  返回百科信息的结果数，默认不返回
        */
        Json::Value landmark_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_landmark_v1, null, data, null);
            return result;
        }

        /**
        * 地标识别
        * @param url 图片完整URL
        * options 可选参数:
        */
        Json::Value landmark_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_landmark_v1, null, data, null);
            return result;
        }


        /**
         * 自定义红酒识别--入库
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E5%85%A5%E5%BA%93
         */
        Json::Value redwine_add_v1_image(std::string const &image, std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_add_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--入库
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E5%85%A5%E5%BA%93
         */
        Json::Value redwine_add_v1_url(std::string const &url, std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            data["brief"] = brief;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_add_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--检索
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E6%A3%80%E7%B4%A2
         */
        Json::Value redwine_search_v1_image(std::string const &image, std::string const &custom_lib,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["custom_lib"] = custom_lib;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_search_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--检索
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E6%A3%80%E7%B4%A2
         */
        Json::Value redwine_search_v1_url(std::string const &url, std::string const &custom_lib,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            data["custom_lib"] = custom_lib;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_search_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--删除
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E5%88%A0%E9%99%A4
         */
        Json::Value redwine_delete_v1_image(std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_delete_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--删除
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92-%E5%88%A0%E9%99%A4
         */
        Json::Value redwine_delete_v1_sign(std::string const &sign,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["cont_sign_list"] = sign;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_delete_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--更新
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92%E6%9B%B4%E6%96%B0
         */
        Json::Value redwine_update_v1_image(std::string const &image, std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_update_v1, null, data, null);
            return result;
        }

        /**
         * 自定义红酒识别--更新
         * 接口使用文档: https://ai.baidu.com/ai-doc/IMAGERECOGNITION/skh4k58o4#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BA%A2%E9%85%92%E6%9B%B4%E6%96%B0
         */
        Json::Value redwine_update_v1_url(std::string const &url, std::string const &brief,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            data["brief"] = brief;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_redwine_update_v1, null, data, null);
            return result;
        }

        /**
         * 车辆属性识别
         * 接口使用文档: https://ai.baidu.com/ai-doc/VEHICLE/mk3hb3fde
         */
        Json::Value vehicle_attr_classify_v2_image(std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_vehicle_attr_classify_v2, null, data, null);
            return result;
        }

        /**
         * 车辆属性识别
         * 接口使用文档: https://ai.baidu.com/ai-doc/VEHICLE/mk3hb3fde
         */
        Json::Value vehicle_attr_classify_v2_url(std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result = this->request(_vehicle_attr_classify_v2, null, data, null);
            return result;
        }
    };
}
#endif
