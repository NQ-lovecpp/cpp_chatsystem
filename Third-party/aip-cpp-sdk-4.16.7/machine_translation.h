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

#ifndef __AIP_MACHINE_TRANSLATION_H__
#define __AIP_MACHINE_TRANSLATION_H__

#include "base/base.h"

namespace aip {

    class Machinetranslation : public AipBase
    {
    public:
    
        std::string _pictrans_v1 = 
            "https://aip.baidubce.com/file/2.0/mt/pictrans/v1";
        std::string _texttrans_v1 = 
            "https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1";
        std::string _texttrans_with_dict_v1 = 
            "https://aip.baidubce.com/rpc/2.0/mt/texttrans-with-dict/v1";
        std::string _doc_translation_create_v2 =
            "https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/create";
        std::string _doc_translation_query_v2 = 
            "https://aip.baidubce.com/rpc/2.0/mt/v2/doc-translation/query";
        std::string _speech_translation_v2 = 
            "https://aip.baidubce.com/rpc/2.0/mt/v2/speech-translation";

        Machinetranslation(const std::string & app_id, const std::string & ak, const std::string & sk)
            : AipBase(app_id, ak, sk)
        {
        }

        /**
         * 文本翻译-通用版
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/MT/4kqryjku9
         */
        Json::Value texttrans_v1(
            std::string const &from,
            std::string const &to,
            std::string const &q,
            const Json::Value & options)
        {
            Json::Value data;
            data["from"] = from;
            data["to"] = to;
            data["q"] = q;
            merge_json(data, options);

            Json::Value result = this->request_com(_texttrans_v1, data);

            return result;
        }

        /**
         * 文本翻译-词典版
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/MT/nkqrzmbpc
         */
        Json::Value texttrans_with_dict_v1(
            std::string const &from,
            std::string const &to,
            std::string const &q,
            const Json::Value & options)
        {
            Json::Value data;
            data["from"] = from;
            data["to"] = to;
            data["q"] = q;
            merge_json(data, options);

            Json::Value result = this->request_com(_texttrans_with_dict_v1, data);

            return result;
        }

        /**
         * 文档翻译
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/MT/Xky9x5xub
         */
        Json::Value doc_translation_create_v2(
            std::string const &from,
            std::string const &to,
            Json::Value & options)
        {
            Json::Value data;
            data["from"] = from;
            data["to"] = to;
            merge_json(data, options);

            Json::Value result =
                    this->request_com(_doc_translation_create_v2, data);

            return result;
        }

        /**
         * 文档翻译-文档状态查询
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/MT/Xky9x5xub
         */
        Json::Value doc_translation_query_v2(
            std::string const &id)
        {
            Json::Value data;
            data["id"] = id;
            Json::Value result = this->request_com(_doc_translation_query_v2, data);

            return result;
        }

        /**
         * 语音翻译
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/MT/el4cmi76f
         */
        Json::Value speech_translation_v2(
            std::string const &from,
            std::string const &to,
            std::string const &voice,
            std::string const &format)
        {
            Json::Value data;
            data["from"] = from;
            data["to"] = to;
            data["voice"] = base64_encode(voice.c_str(), (int) voice.size());
            data["format"] = format;
            Json::Value result =
                this->request_com(_speech_translation_v2, data);

            return result;
        }
        
    };
}
#endif