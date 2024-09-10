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

#ifndef __AIP_BODY_ANALYSIS_H__
#define __AIP_BODY_ANALYSIS_H__

#include "base/base.h"

namespace aip {

    class Bodyanalysis : public AipBase
    {
    public:

        std::string _body_analysis_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_analysis";
        std::string _body_attr_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_attr";
        std::string _body_num_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_num";
        std::string _driver_behavior_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/driver_behavior";
        std::string _body_seg_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg";
        std::string _gesture_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/gesture";
        std::string _body_tracking_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/body_tracking";
        std::string _hand_analysis_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/hand_analysis";
        std::string _body_danger_v1 = 
            "https://aip.baidubce.com/rest/2.0/video-classify/v1/body_danger";
        std::string _fingertip_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/fingertip";

        Bodyanalysis(const std::string & app_id, const std::string & ak, const std::string & sk)
            : AipBase(app_id, ak, sk)
        {
        }


        /**
         * 人体关键点识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/0k3cpyxme
         */
        Json::Value body_analysis_v1(
            std::string const &image)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                this->request(_body_analysis_v1, null, data, null);

            return result;
        }

        /**
         * 人体检测与属性识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/Ak3cpyx6v
         */
        Json::Value body_attr_v1(
            std::string const &image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_body_attr_v1, null, data, null);

            return result;
        }

        /**
         * 人流量统计
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/7k3cpyy1t
         */
        Json::Value body_num_v1(
            std::string const &image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_body_num_v1, null, data, null);

            return result;
        }

        /**
         * 驾驶行为分析
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/Nk3cpywct
         */
        Json::Value driver_behavior_v1(
            std::string const &image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_driver_behavior_v1, null, data, null);

            return result;
        }

        /**
         * 人像分割
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/Fk3cpyxua
         */
        Json::Value body_seg_v1(
            std::string const &image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_body_seg_v1, null, data, null);

            return result;
        }

        /**
         * 手势识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/4k3cpywrv
         */
        Json::Value gesture_v1(
            std::string const &image)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                this->request(_gesture_v1, null, data, null);

            return result;
        }

        /**
         * 人流量统计（动态版）
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/wk3cpyyog
         */
        Json::Value body_tracking_v1(
            std::string const &dynamic,
            std::string const &image,
            Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["dynamic"] = dynamic;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_body_tracking_v1, data, &headers);

            return result;
        }

        /**
         * 手部关键点识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/Kk3cpyxeu
         */
        Json::Value hand_analysis_v1(
            std::string const &image)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                this->request(_hand_analysis_v1, null, data, null);

            return result;
        }

        /**
         * 危险行为识别
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/uk3cpywke
         */
        Json::Value body_danger_v1(
            std::string const &video_data)
        {
            std::map<std::string, std::string> data;
            data["data"] = base64_encode(video_data.c_str(), (int) video_data.size());
            Json::Value result =
                this->request(_body_danger_v1, null, data, null);

            return result;
        }

        /**
         * 指尖检测
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/BODY/Jk7ir38ut
         */
        Json::Value fingertip_v1(
            std::string const &image)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                this->request(_fingertip_v1, null, data, null);

            return result;
        }

    };
}
#endif