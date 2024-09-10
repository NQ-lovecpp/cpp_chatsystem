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

#ifndef __AIP_CONTENTCENSOR_H__
#define __AIP_CONTENTCENSOR_H__

#include "base/base.h"

namespace aip {

class Contentcensor: public AipBase
{
public:
    std::string _img_censor_user_defined_v2 = 
        "https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined";
    std::string _text_censor_user_defined_v2 = 
        "https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined";
    std::string _live_save_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/live/v1/config/save";
    std::string _live_stop_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/live/v1/config/stop";
    std::string _live_view_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/live/v1/config/view";
    std::string _live_pull_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/live/v1/audit/pull";
    std::string _video_censor_submit_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/video_censor/v1/video/submit";
    std::string _video_censor_pull_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/video_censor/v1/video/pull";
    std::string _async_voice_submit_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/async_voice/submit";
    std::string _async_voice_pull_v1 = "https://aip.baidubce.com/rest/2.0/solution/v1/async_voice/pull";
    std::string _document_censor_submit_url = "https://aip.baidubce.com/rest/2.0/solution/v1/solution/document/v1/submit";
    std::string _document_censor_pull_url = "https://aip.baidubce.com/rest/2.0/solution/v1/solution/document/v1/pull";
    
    Contentcensor(const std::string & app_id, const std::string & ak, const std::string & sk)
        : AipBase(app_id, ak, sk)
    {
    }

    /**
     * 内容审核平台-图像
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/jk42xep4e
     */
    Json::Value img_censor_user_defined_v2_img(std::string const &image, const Json::Value & options)
    {
        Json::Value data;
        data["image"] = base64_encode(image.c_str(), (int) image.size());
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_img_censor_user_defined_v2, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-图像
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/jk42xep4e
     */
    Json::Value img_censor_user_defined_v2_url(std::string const &imgUrl, const Json::Value & options)
    {
        Json::Value data;
        data["imgUrl"] = imgUrl;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_img_censor_user_defined_v2, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-文本
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/Rk3h6xb3i
     */
    Json::Value text_censor_user_defined_v2(std::string const &text)
    {
        std::map<std::string, std::string> data;
        data["text"] = text;
        Json::Value result =
            this->request(_text_censor_user_defined_v2, null, data, null);
        return result;
    }

    /**
     * 内容审核平台-直播流（新增任务）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/mkxlraoz5
     */
    Json::Value live_save_v1(std::string const &streamUrl, std::string const &streamType,
        std::string const &extId, long long const &startTime,
        long long const &endTime, std::string const &streamName, const Json::Value & options)
    {
        Json::Value data;
        data["streamUrl"] = streamUrl;
        data["streamType"] = streamType;
        data["extId"] = extId;
        data["startTime"] = startTime;
        data["endTime"] = endTime;
        data["streamName"] = streamName;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_live_save_v1, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-直播流（删除任务）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/Ckxls2owb
     */
    Json::Value live_stop_v1(
        std::string const &taskId,
        const Json::Value & options)
    {
        Json::Value data;
        data["taskId"] = taskId;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_live_stop_v1, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-直播流（查看配置）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/ckxls6tl1
     */
    Json::Value live_view_v1(
        std::string const &taskId,
        const Json::Value & options)
    {
        Json::Value data;
        data["taskId"] = taskId;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_live_view_v1, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-直播流（获取结果）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/Pkxlshd1s
     */
    Json::Value live_pull_v1(
        std::string const &taskId,
        const Json::Value & options)
    {
        Json::Value data;
        data["taskId"] = taskId;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_live_view_v1, data, &headers);

        return result;
    }


    /**
     * 内容审核平台-长视频（提交任务）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/bksy7ak30
     */
    Json::Value video_censor_submit_v1(
        std::string const &url,
        std::string const &extId,
        const Json::Value & options)
    {
        Json::Value data;
        data["url"] = url;
        data["extId"] = extId;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_video_censor_submit_v1, data, &headers);

        return result;
    }

    /**
     * 内容审核平台-长视频（获取结果）
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/jksy7j3jv
     */
    Json::Value video_censor_pull_v1(
        std::string const &taskId,
        const Json::Value & options)
    {
        Json::Value data;
        data["taskId"] = taskId;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_video_censor_pull_v1, data, &headers);

        return result;
    }

    /**
     * 音频文件异步审核
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/akxlple3t
     */
    Json::Value async_voice_submit_v1(
        std::string const &url, std::string const &fmt, int rate,
        const Json::Value & options)
    {
        Json::Value data;
        data["url"] = url;
        data["fmt"] = fmt;
        data["rate"] = rate;
        merge_json(data, options);

        std::map<std::string, std::string> headers;
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        Json::Value result = this->request_com(_async_voice_submit_v1, data, &headers);

        return result;
    }

    /**
     * 音频文件异步审核-查询
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/jkxlpxllo
     */
    Json::Value async_voice_pull_v1_taskid(
        std::string const &taskId)
    {
        std::map<std::string, std::string> data;
        data["taskId"] = taskId;
        Json::Value result =
            this->request(_async_voice_pull_v1, null, data, null);
        return result;
    }

    /**
     * 音频文件异步审核-查询
     * 接口使用文档链接: https://ai.baidu.com/ai-doc/ANTIPORN/jkxlpxllo
     */
    Json::Value async_voice_pull_v1_audioid(
        std::string const &audioId)
    {
        std::map<std::string, std::string> data;
        data["audioId"] = audioId;
        Json::Value result =
            this->request(_async_voice_pull_v1, null, data, null);
        return result;
    }

    /**
     * 文档审核-提交任务
     * https://ai.baidu.com/ai-doc/ANTIPORN/2l8484xvl
     */
    Json::Value document_censor_file_submit(
            std::string const & file_name,
            std::string const & document,
            const std::map<std::string, std::string> & options)
    {
        std::map<std::string, std::string> data;

        data["fileBase64"] = base64_encode(document.c_str(), (int) document.size());
        data["fileName"] = file_name;
        std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

        Json::Value result =
                this->request(_document_censor_submit_url, null, data, null);

        return result;
    }

    /**
     * 文档审核-提交任务
     * https://ai.baidu.com/ai-doc/ANTIPORN/2l8484xvl
     */
    Json::Value document_censor_url_submit(
            std::string const & file_name,
            std::string const & url,
            const std::map<std::string, std::string> & options)
    {
        std::map<std::string, std::string> data;

        data["url"] = url;
        data["fileName"] = file_name;
        std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

        Json::Value result =
                this->request(_document_censor_submit_url, null, data, null);

        return result;
    }

    /**
     * 文档审核-拉取结果
     * https://ai.baidu.com/ai-doc/ANTIPORN/4l848df5n
     */
    Json::Value document_censor_pull(
            std::string const & task_id,
            const std::map<std::string, std::string> & options)
    {
        std::map<std::string, std::string> data;

        data["taskId"] = task_id;
        std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

        Json::Value result =
                this->request(_document_censor_pull_url, null, data, null);

        return result;
    }
    
};
}
#endif
