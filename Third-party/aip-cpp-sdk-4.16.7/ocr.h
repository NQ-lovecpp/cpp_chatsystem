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

#ifndef __AIP_OCR_H__
#define __AIP_OCR_H__

#include "base/base.h"

namespace aip {

    class Ocr : public AipBase {
    public:

        std::string _medical_detail =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_detail";

        std::string _weight_note =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/weight_note";

        std::string _online_taxi_itinerary =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/online_taxi_itinerary";
        std::string _invoice =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/invoice";

        std::string _passport =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/passport";

        std::string _air_ticket =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/air_ticket";

        std::string _household_register =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/household_register";

        std::string _vehicle_certificate =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_certificate";

        std::string _vehicle_invoice =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_invoice";

        std::string _qrcode =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/qrcode";

        std::string _doc_analysis_office =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/doc_analysis_office";

        std::string _handwriting =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting";

        std::string _doc_analysis =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/doc_analysis";

        std::string _meter =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/meter";

        std::string _webimage_loc =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/webimage_loc";

        std::string _seal =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/seal";

        std::string _general_basic =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic";

        std::string _accurate_basic =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic";

        std::string _general =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/general";

        std::string _accurate =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate";

        std::string _general_enhanced =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/general_enhanced";

        std::string _webimage =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/webimage";

        std::string _idcard =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/idcard";

        std::string _bankcard =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/bankcard";

        std::string _driving_license =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/driving_license";

        std::string _vehicle_license =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/vehicle_license";

        std::string _license_plate =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/license_plate";

        std::string _business_license =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/business_license";

        std::string _receipt =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/receipt";

        std::string _table_recognize =
                "https://aip.baidubce.com/rest/2.0/solution/v1/form_ocr/request";

        std::string _table_result_get =
                "https://aip.baidubce.com/rest/2.0/solution/v1/form_ocr/get_request_result";

        std::string _vat_invoice =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/vat_invoice";

        std::string _taxi_receipt =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/taxi_receipt";

        std::string _vin_code =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/vin_code";

        std::string _numbers =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/numbers";

        std::string _train_ticket =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/train_ticket";

        std::string _lottery_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/lottery";

        std::string _insurance_documents_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/insurance_documents";

        std::string _taiwan_exitentrypermit_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/taiwan_exitentrypermit";

        std::string _HK_Macau_exitentrypermit_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/HK_Macau_exitentrypermit";

        std::string _birth_certificate_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/birth_certificate";

        std::string _business_card_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/business_card";

        std::string _quota_invoice_v1 =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/quota_invoice";

        std::string _recognise_iocr_v1 =
                "https://aip.baidubce.com/rest/2.0/solution/v1/iocr/recognise";

        std::string _recognise_iocr_finance =
                "https://aip.baidubce.com/rest/2.0/solution/v1/iocr/recognise/finance";

        std::string _bus_ticket =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/bus_ticket";

        std::string _toll_invoice =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/toll_invoice";

        std::string _multi_card_classify =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/multi_card_classify";

        std::string _intelligent_ocr =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/intelligent_ocr";

        std::string _medical_record =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_record";

        std::string _medical_statement =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_statement";

        std::string _ferry_ticket =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/ferry_ticket";

        std::string _used_vehicle_invoice =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/used_vehicle_invoice";

        std::string _multi_idcard =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/multi_idcard";

        std::string _travel_card =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/travel_card";

        std::string _social_security_card =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/social_security_card";

        std::string _medical_report_detection =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_report_detection";

        std::string _medical_recipts_classify =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_recipts_classify";

        std::string _waybill =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/waybill";

        std::string _medical_summary =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_summary";

        std::string _shopping_receipt =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/shopping_receipt";

        std::string _road_transport_certificate =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/road_transport_certificate";

        std::string _table =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/table";

        std::string _remove_handwriting =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/remove_handwriting";

        std::string _doc_crop_enhance =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/doc_crop_enhance";

        std::string _health_code =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/health_code";

        std::string _covid_test =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/covid_test";

        std::string _medical_prescription =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_prescription";

        std::string _medical_outpatient =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_outpatient";

        std::string _medical_summary_diagnosis =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/medical_summary_diagnosis";

        std::string _health_report =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/health_report";

        std::string _doc_convert_request_v1 = "https://aip.baidubce.com/rest/2.0/ocr/v1/doc_convert/request";

        std::string _doc_convert_result_v1 = "https://aip.baidubce.com/rest/2.0/ocr/v1/doc_convert/get_request_result";

        std::string _bank_receipt_new = "https://aip.baidubce.com/rest/2.0/ocr/v1/bank_receipt_new";

        std::string _marriage_certificate = "https://aip.baidubce.com/rest/2.0/ocr/v1/marriage_certificate";

        std::string _hk_macau_taiwan_exitentrypermit =
                "https://aip.baidubce.com/rest/2.0/ocr/v1/hk_macau_taiwan_exitentrypermit";

        Ocr(const std::string &app_id, const std::string &ak, const std::string &sk) : AipBase(app_id, ak, sk) {
        }

        /**
         * general_basic
         * 用户向服务请求识别某张图中的所有文字
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general_basic(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general_basic, null, data, null);

            return result;
        }

        /**
         * general_basic_url
         * 用户向服务请求识别某张图中的所有文字
         * @param url 图片完整URL，URL长度不超过1024字节，URL对应的图片base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式，当image字段存在时url字段失效

         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general_basic_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general_basic, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（标准版）
         * https://ai.baidu.com/ai-doc/OCR/zk3h7xz52
         *
         * @param pdf
         * @param options
         * @return
         */
        Json::Value general_basic_pdf(
                std::string const &pdf,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf.c_str(), (int) pdf.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general_basic, null, data, null);

            return result;
        }

        /**
         * accurate_basic
         * 用户向服务请求识别某张图中的所有文字，相对于通用文字识别该产品精度更高，但是没有免费额度，如果您需要使用该产品，您可以在产品页面点击合作咨询或加入文字识别的官网QQ群：631977213向管理员申请试用。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value accurate_basic(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate_basic, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（高精度版）
         * https://ai.baidu.com/ai-doc/OCR/1k3h7y3db
         *
         * @param url
         * @param options
         * @return
         */
        Json::Value accurate_basic_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate_basic, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（高精度版）
         * https://ai.baidu.com/ai-doc/OCR/1k3h7y3db
         *
         * @param pdf
         * @param options
         * @return
         */
        Json::Value accurate_basic_pdf(
                std::string const &pdf,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf.c_str(), (int) pdf.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate_basic, null, data, null);

            return result;
        }

        /**
         * general
         * 用户向服务请求识别某张图中的所有文字，并返回文字在图中的位置信息。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * vertexes_location 是否返回文字外接多边形顶点位置，不支持单字位置。默认为false
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general, null, data, null);

            return result;
        }

        /**
         * general_url
         * 用户向服务请求识别某张图中的所有文字，并返回文字在图中的位置信息。
         * @param url 图片完整URL，URL长度不超过1024字节，URL对应的图片base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式，当image字段存在时url字段失效

         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * vertexes_location 是否返回文字外接多边形顶点位置，不支持单字位置。默认为false
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（标准含位置版）
         * https://ai.baidu.com/ai-doc/OCR/vk3h7y58v
         *
         * @param pdf
         * @param options
         * @return
         */
        Json::Value general_pdf(
                std::string const &pdf,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf.c_str(), (int) pdf.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general, null, data, null);

            return result;
        }

        /**
         * accurate
         * 用户向服务请求识别某张图中的所有文字，相对于通用文字识别（含位置信息版）该产品精度更高，但是没有免费额度，如果您需要使用该产品，您可以在产品页面点击合作咨询或加入文字识别的官网QQ群：631977213向管理员申请试用。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * vertexes_location 是否返回文字外接多边形顶点位置，不支持单字位置。默认为false
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value accurate(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（高精度含位置版）
         * https://ai.baidu.com/ai-doc/OCR/tk3h7y2aq
         *
         * @param url
         * @param options
         * @return
         */
        Json::Value accurate_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate, null, data, null);

            return result;
        }

        /**
         * 通用文字识别（高精度含位置版）
         * https://ai.baidu.com/ai-doc/OCR/tk3h7y2aq
         *
         * @param pdf
         * @param options
         * @return
         */
        Json::Value accurate_pdf(
                std::string const &pdf,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf.c_str(), (int) pdf.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_accurate, null, data, null);

            return result;
        }

        /**
         * general_enhanced
         * 某些场景中，图片中的中文不光有常用字，还包含了生僻字，这时用户需要对该图进行文字识别，应使用通用文字识别（含生僻字版）。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general_enhanced(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general_enhanced, null, data, null);

            return result;
        }

        /**
         * general_enhanced_url
         * 某些场景中，图片中的中文不光有常用字，还包含了生僻字，这时用户需要对该图进行文字识别，应使用通用文字识别（含生僻字版）。
         * @param url 图片完整URL，URL长度不超过1024字节，URL对应的图片base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式，当image字段存在时url字段失效

         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG。可选值包括：<br/>- CHN_ENG：中英文混合；<br/>- ENG：英文；<br/>- POR：葡萄牙语；<br/>- FRE：法语；<br/>- GER：德语；<br/>- ITA：意大利语；<br/>- SPA：西班牙语；<br/>- RUS：俄语；<br/>- JAP：日语；<br/>- KOR：韩语；
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         * probability 是否返回识别结果中每一行的置信度
         */
        Json::Value general_enhanced_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_general_enhanced, null, data, null);

            return result;
        }

        /**
         * webimage
         * 用户向服务请求识别一些网络上背景复杂，特殊字体的文字。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         */
        Json::Value webimage(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_webimage, null, data, null);

            return result;
        }

        /**
         * webimage_url
         * 用户向服务请求识别一些网络上背景复杂，特殊字体的文字。
         * @param url 图片完整URL，URL长度不超过1024字节，URL对应的图片base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式，当image字段存在时url字段失效

         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_language 是否检测语言，默认不检测。当前支持（中文、英语、日语、韩语）
         */
        Json::Value webimage_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_webimage, null, data, null);

            return result;
        }

        /**
         * idcard
         * 用户向服务请求识别身份证，身份证识别包括正面和背面。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * @param id_card_side front：身份证正面；back：身份证背面
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * detect_risk 是否开启身份证风险类型(身份证复印件、临时身份证、身份证翻拍、修改过的身份证)功能，默认不开启，即：false。可选值:true-开启；false-不开启
         */
        Json::Value idcard(
                std::string const &image,
                std::string const &id_card_side,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["id_card_side"] = id_card_side;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_idcard, null, data, null);

            return result;
        }

        /**
         * 身份证识别
         * https://ai.baidu.com/ai-doc/OCR/rk3h7xzck
         *
         * @param url
         * @param id_card_side
         * @param options
         * @return
         */
        Json::Value idcard_url(
                std::string const &url,
                std::string const &id_card_side,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;
            data["id_card_side"] = id_card_side;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_idcard, null, data, null);

            return result;
        }

        /**
         * bankcard
         * 识别银行卡并返回卡号和发卡行。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value bankcard(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_bankcard, null, data, null);

            return result;
        }

        /**
         * driving_license
         * 对机动车驾驶证所有关键字段进行识别
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         */
        Json::Value driving_license(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_driving_license, null, data, null);

            return result;
        }

        /**
         * 驾驶证识别
         * https://ai.baidu.com/ai-doc/OCR/Vk3h7xzz7
         *
         * @param url
         * @param options
         * @return
         */
        Json::Value driving_license_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_driving_license, null, data, null);

            return result;
        }

        /**
         * vehicle_license
         * 对机动车行驶证正本所有关键字段进行识别
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括:<br/>- true：检测朝向；<br/>- false：不检测朝向。
         * accuracy normal 使用快速服务，1200ms左右时延；缺省或其它值使用高精度服务，1600ms左右时延
         */
        Json::Value vehicle_license(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vehicle_license, null, data, null);

            return result;
        }

        /**
         * 行驶证识别
         * https://ai.baidu.com/ai-doc/OCR/yk3h7y3ks
         *
         * @param url
         * @param options
         * @return
         */
        Json::Value vehicle_license_url(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vehicle_license, null, data, null);

            return result;
        }

        /**
         * license_plate
         * 识别机动车车牌，并返回签发地和号牌。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value license_plate(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_license_plate, null, data, null);

            return result;
        }

        /**
         * business_license
         * 识别营业执照，并返回关键字段的值，包括单位名称、法人、地址、有效期、证件编号、社会信用代码等。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value business_license(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_business_license, null, data, null);

            return result;
        }

        /**
         * receipt
         * 用户向服务请求识别医疗票据、发票、的士票、保险保单等票据类图片中的所有文字，并返回文字在图中的位置信息。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         * probability 是否返回识别结果中每一行的置信度
         * accuracy normal 使用快速服务，1200ms左右时延；缺省或其它值使用高精度服务，1600ms左右时延
         */
        Json::Value receipt(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_receipt, null, data, null);

            return result;
        }

        /**
         * table_recognize
         * 自动识别表格线及表格内容，结构化输出表头、表尾及每个单元格的文字内容。表格文字识别接口为异步接口，分为两个API：提交请求接口、获取结果接口。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value table_recognize(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_table_recognize, null, data, null);

            return result;
        }

        /**
         * table_result_get
         * 获取表格文字识别结果
         * @param request_id 发送表格文字识别请求时返回的request id
         * options 可选参数:
         * result_type 期望获取结果的类型，取值为“excel”时返回xls文件的地址，取值为“json”时返回json格式的字符串,默认为”excel”
         */
        Json::Value table_result_get(
                std::string const &request_id,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["request_id"] = request_id;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_table_result_get, null, data, null);

            return result;
        }

        /**
         * 
         * 增值税发票识别
         * @param image 图像二进制内容 
         * options 可选参数:
         */
        Json::Value vatInvoice(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vat_invoice, null, data, null);

            return result;
        }

        /**
         * 
         * 增值税发票识别
         * @param image 发票图像URL地址 
         * options 可选参数:
         */
        Json::Value vatInvoiceUrl(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = image;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vat_invoice, null, data, null);

            return result;
        }

        /**
         * 
         * 增值税发票识别
         * @param image 发票pdf文件二进制数据 
         * options 可选参数:
         */
        Json::Value vatInvoicePdf(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vat_invoice, null, data, null);

            return result;
        }

        /**
        *
        * 出租车发票识别
        * @param image 图像二进制内容
        * options 可选参数:
        */
        Json::Value taxiReceipt(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_taxi_receipt, null, data, null);

            return result;
        }

        /**
        *
        * 出租车票识别
        * @param image 发票图像URL地址
        * options 可选参数:
        */
        Json::Value taxiReceiptUrl(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = image;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_taxi_receipt, null, data, null);

            return result;
        }

        /**
        *
        * vin码识别
        * @param image 图像二进制内容
        * options 可选参数:
        */
        Json::Value vinCode(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vin_code, null, data, null);

            return result;
        }

        /**
        *
        * vin 码识别
        * @param image 发票图像URL地址
        * options 可选参数:
        */
        Json::Value vinCodeUrl(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = image;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_vin_code, null, data, null);

            return result;
        }

        /**
         * 
         * 火车票票识别
         * @param image 图像二进制内容 
         * options 可选参数:
         */
        Json::Value trainTicket(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_train_ticket, null, data, null);

            return result;
        }

        /**
        *
        * 火车票票识别
        * @param image 发票图像URL地址
        * options 可选参数:
        */
        Json::Value trainTicketUrl(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = image;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_train_ticket, null, data, null);

            return result;
        }

        /**
         * 
         * 数字识别
         * @param image 图像二进制内容 
         * options 可选参数:
         */
        Json::Value numbers(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_numbers, null, data, null);

            return result;
        }


        /**
         * 印章识别
         * 检测并识别合同文件或常用票据中的印章，输出文字内容、印章位置信息以及相关置信度，已支持圆形章、椭圆形章、方形章等常见印章检测与识别
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value seal(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_seal, null, data, null);

            return result;
        }

        /**
         * 网络图片文字识别（含位置版）
         * 支持识别艺术字体或背景复杂的文字内容，除文字信息外，还可返回每行文字的位置信息、行置信度，以及单字符内容和位置等。
         * @param image 二进制图像数据
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度
         * probability 是否返回每行识别结果的置信度。默认为false
         * poly_location 是否返回文字所在区域的外接四边形的4个点坐标信息。默认为false
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         */
        Json::Value webimageloc(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_webimage_loc, null, data, null);

            return result;
        }

        /**
         * 网络图片文字识别（含位置版）
         * 支持识别艺术字体或背景复杂的文字内容，除文字信息外，还可返回每行文字的位置信息、行置信度，以及单字符内容和位置等。
         * @param url 图片完整URL
         * options 可选参数:
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度
         * probability 是否返回每行识别结果的置信度。默认为false
         * poly_location 是否返回文字所在区域的外接四边形的4个点坐标信息。默认为false
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         */
        Json::Value webimagelocurl(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_webimage_loc, null, data, null);

            return result;
        }

        /**
         * 仪器仪表盘读数识别
         * 适用于不同品牌、不同型号的仪器仪表盘读数识别，广泛适用于各类血糖仪、血压仪、燃气表、电表等，可识别表盘上的数字、英文、符号，支持液晶屏、字轮表等表型。
         * @param image 二进制图像数据
         * options 可选参数:
         * probability 是否返回每行识别结果的置信度。默认为false
         * poly_location 位置信息返回形式，默认：false
         */
        Json::Value meter(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_meter, null, data, null);

            return result;
        }

        /**
         * 试卷分析与识别
         * 可对文档版面进行分析，输出图、表、标题、文本的位置，并输出分版块内容的OCR识别结果，支持中、英两种语言，手写、印刷体混排多种场景
         * @param url 图片url
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG 可选值包括：CHN_ENG：中英文 ENG：英文
         * result_type 返回识别结果是按单行结果返回，还是按单字结果返回，默认为big。
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度
         * line_probability 是否返回每行识别结果的置信度。默认为false
         * words_type 文字类型。默认：印刷文字识别
         * layout_analysis 是否分析文档版面：包括图、表、标题、段落的分析输出
         */
        Json::Value docanalysisurl(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_doc_analysis, null, data, null);

            return result;
        }

        /**
         * 手写文字识别
         * 支持对图片中的手写中文、手写数字进行检测和识别，针对不规则的手写字体进行专项优化，识别准确率可达90%以上
         * @param image 二进制图像数据
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置
         * probability 是否返回识别结果中每一行的置信度，默认为false，不返回置信度
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度。可选值包括
         */
        Json::Value handwriting(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_handwriting, null, data, null);

            return result;
        }

        /**
         * 办公文档识别
         * 可对办公类文档版面进行分析，输出图、表、标题、文本的位置，并输出分版块内容的OCR识别结果，支持中、英两种语言，手写、印刷体混排多种场景。
         * @param image 二进制图像数据
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG 可选值包括：CHN_ENG：中英文 ENG：英文
         * result_type 返回识别结果是按单行结果返回，还是按单字结果返回，默认为big。
         * detect_direction 是否检测图像朝向，默认不检测，即：false。朝向是指输入图像是正常方向、逆时针旋转90/180/270度
         * line_probability 是否返回每行识别结果的置信度。默认为false
         * words_type 文字类型。默认：印刷文字识别
         * layout_analysis 是否分析文档版面：包括图、表、标题、段落的分析输出
         * erase_seal 是否先擦除水印、印章后再识别文档
         */
        Json::Value docanalysisoffice(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_doc_analysis_office, null, data, null);

            return result;
        }

        /**
         * 二维码识别
         * 对图片中的二维码、条形码进行检测和识别，返回存储的文字信息
         * @param image 二进制图像数据
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，big：不定位单字符位置，默认值；small：定位单字符位置&probability
         */
        Json::Value qrcode(
                std::string const &image,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_qrcode, null, data, null);

            return result;
        }

        /**
         * 仪器仪表盘读数识别
         * 适用于不同品牌、不同型号的仪器仪表盘读数识别，广泛适用于各类血糖仪、血压仪、燃气表、电表等，可识别表盘上的数字、英文、符号，支持液晶屏、字轮表等表型。
         * @param url 图像url地址
         * options 可选参数:
         * probability 是否返回每行识别结果的置信度。默认为false
         * poly_location 位置信息返回形式，默认：false
         */
        Json::Value meterurl(
                std::string const &url,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                    this->request(_meter, null, data, null);

            return result;
        }

        /**
         * 二维码识别
         * 对图片中的二维码、条形码进行检测和识别，返回存储的文字信息
         * @param url 图片完整URL
         * options 可选参数:

         */
        Json::Value qrcodeUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_qrcode, null, data, null);
            return result;
        }

        /**
         * 试卷分析与识别
         * 支持对车辆合格证的23个关键字段进行结构化识别
         * @param image 二进制图像数据
         * options 可选参数:
         * multi_detect 控制是否开启多航班信息识别功能,默认值：false
         */
        Json::Value docAnalysis(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_doc_analysis, null, data, null);
            return result;
        }

        /**
         * 试卷分析与识别
         * 支持对车辆合格证的23个关键字段进行结构化识别
         * @param url 图片完整URL
         * options 可选参数:
         * multi_detect 控制是否开启多航班信息识别功能,默认值：false
         */
        Json::Value docAnalysisUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_doc_analysis, null, data, null);
            return result;
        }

        /**
         * 机动车销售发票
         * 支持对机动车销售发票的26个关键字段进行结构化识别，
         * @param image 二进制图像数据
         * options 可选参数:

         */
        Json::Value vehicleInvoice(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_invoice, null, data, null);
            return result;
        }

        /**
         * 机动车销售发票
         * 支持对机动车销售发票的26个关键字段进行结构化识别，
         * @param url 图片完整URL
         * options 可选参数:

         */
        Json::Value vehicleInvoiceUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_invoice, null, data, null);
            return result;
        }

        /**
         * 车辆合格证
         * 支持对车辆合格证的23个关键字段进行结构化识别，包括合格证编号、发证日期、车辆制造企业名、车辆品牌、车辆名称、车辆型号、车架号、车身颜色、
         发动机型号、发动机号、燃料种类、排量、功率、排放标准、轮胎数、轴距、轴数、转向形式、总质量、整备质量、驾驶室准乘人数、最高设计车速、车辆制造日期
         * @param image 二进制图像数据
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG         * result_type 返回识别结果是按单行结果返回，还是按单字结果返回，默认为big         
         * detect_direction 是否检测图像朝向，默认不检测，即：false         * line_probability 是否返回每行识别结果的置信度。默认为false        
          * words_type 文字类型。
         */
        Json::Value vehicleCertificate(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_certificate, null, data, null);
            return result;
        }

        /**
         * 车辆合格证
         * 支持对车辆合格证的23个关键字段进行结构化识别，包括合格证编号、发证日期、车辆制造企业名、车辆品牌、车辆名称、车辆型号、车架号、车身颜色、发动机型号
         、发动机号、燃料种类、排量、功率、排放标准、轮胎数、轴距、轴数、转向形式、总质量、整备质量、驾驶室准乘人数、最高设计车速、车辆制造日期
         * @param url 图片完整URL
         * options 可选参数:
         * language_type 识别语言类型，默认为CHN_ENG         * result_type 返回识别结果是按单行结果返回，还是按单字结果返回，默认为big         
         * detect_direction 是否检测图像朝向，默认不检测，即：false         * line_probability 是否返回每行识别结果的置信度。默认为false        
          * words_type 文字类型。
         */
        Json::Value vehicleCertificateUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_vehicle_certificate, null, data, null);
            return result;
        }

        /**
         * 户口本识别
         * 支持对户口本内常住人口登记卡的全部 22 个字段进行结构化识别，
         * @param image 二进制图像数据
         * options 可选参数:

         */
        Json::Value householdRegister(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_household_register, null, data, null);
            return result;
        }

        /**
         * 户口本识别
         * 支持对户口本内常住人口登记卡的全部 22 个字段进行结构化识别，
         * @param url 图片完整URL
         * options 可选参数:

         */
        Json::Value householdRegisterUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_household_register, null, data, null);
            return result;
        }

        /**
         * 手写文字识别
         * 支持对图片中的手写中文、手写数字进行检测和识别，
         * @param url 图片完整URL
         * options 可选参数:
         * recognize_granularity 是否定位单字符位置，         * probability 是否返回识别结果中每一行的置信度，默认为false，不返回置信度         
         * detect_direction 是否检测图像朝向，默认不检测，即：false
         */
        Json::Value handwritingUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_handwriting, null, data, null);
            return result;
        }

        /**
         * 飞机行程单识别
         * 支持对飞机行程单的24个字段进行结构化识别，包括电子客票号、印刷序号、姓名、始发站、目的站、航班号、日期、时间、票价、身份证号、承运人、民航发展基金、
         保险费、燃油附加费、其他税费、合计金额、填开日期、订票渠道、客票级别、座位等级、销售单位号、签注、免费行李、验证码。 同时，支持单张行程单上的多航班信息识别。
         * @param image 二进制图像数据
         * options 可选参数:
         * multi_detect 控制是否开启多航班信息识别功能,默认值：false
         */
        Json::Value airTicket(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_air_ticket, null, data, null);
            return result;
        }

        /**
         * 飞机行程单识别
         * 支持对飞机行程单的24个字段进行结构化识别，包括电子客票号、印刷序号、姓名、始发站、目的站、航班号、日期、时间、票价、身份证号、承运人、
         民航发展基金、保险费、燃油附加费、其他税费、合计金额、填开日期、订票渠道、客票级别、座位等级、销售单位号、签注、免费行李、验证码。 同时，
         支持单张行程单上的多航班信息识别。
         * @param url 图片完整URL
         * options 可选参数:
         * multi_detect 控制是否开启多航班信息识别功能,默认值：false
         */
        Json::Value airTicketUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_air_ticket, null, data, null);
            return result;
        }

        /**
         * 通用机打发票
         * 支持对图片中的手写中文、手写数字进行检测和识别，
         * @param image 二进制图像数据
         * options 可选参数:
         * location 是否输出位置信息，true：输出位置信息，false：不输出位置信息，默认false
         */
        Json::Value invoice(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_invoice, null, data, null);
            return result;
        }

        /**
         * 通用机打发票
         * 支持对图片中的手写中文、手写数字进行检测和识别，
         * @param url 图片完整URL
         * options 可选参数:
         * location 是否输出位置信息，true：输出位置信息，false：不输出位置信息，默认false
         */
        Json::Value invoiceUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_invoice, null, data, null);
            return result;
        }

        /**
         * 护照识别
         * 支持对图片中的手写中文、手写数字进行检测和识别，
         * @param image 二进制图像数据
         * options 可选参数:

         */
        Json::Value passport(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_passport, null, data, null);
            return result;
        }

        /**
         * 护照识别
         * 支持对图片中的手写中文、手写数字进行检测和识别，
         * @param url 图片完整URL
         * options 可选参数:

         */
        Json::Value passportUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_passport, null, data, null);
            return result;
        }

        /**
         * 网约车行程单识别
         * 对各大主要服务商的网约车行程单进行结构化识别，包括滴滴打车、花小猪打车、高德地图、曹操出行、阳光出行，支持识别服务商、
        行程开始时间、行程结束时间、车型、总金额等16 个关键字段。
    
         * @param image 二进制图像数据
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页
         */
        Json::Value onlineTaxiItinerary(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_online_taxi_itinerary, null, data, null);
            return result;
        }

        /**
         * 网约车行程单识别
         * 对各大主要服务商的网约车行程单进行结构化识别，包括滴滴打车、花小猪打车、高德地图、曹操出行、阳光出行，支持识别服务商、
        行程开始时间、行程结束时间、车型、总金额等16 个关键字段。
    
         * @param url 图片完整URL路径
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页
         */
        Json::Value onlineTaxiItineraryUrl(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_online_taxi_itinerary, null, data, null);
            return result;
        }

        /**
         * 网约车行程单识别
         * 对各大主要服务商的网约车行程单进行结构化识别，包括滴滴打车、花小猪打车、高德地图、曹操出行、阳光出行，支持识别服务商、
        行程开始时间、行程结束时间、车型、总金额等16 个关键字段。
    
         * @param pdf_file pdf文件二进制数据
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页
         */
        Json::Value onlineTaxiItineraryPdf(
                std::string pdf_file,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_online_taxi_itinerary, null, data, null);
            return result;
        }

        /**
         * 磅单识别
         * 结构化识别磅单的车牌号、打印时间、毛重、皮重、净重、发货单位、收货单位、单号8个关键字段，现阶段仅支持识别印刷体磅单
         * @param image 二进制图像数据
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页         * probability 是否返回字段识别结果的置信度，默认为 false，可缺省
                - false：不返回字段识别结果的置信度
                - true：返回字段识别结果的置信度，包括字段识别结果中各字符置信度的平均值（average）和最小值（min）
            
         */
        Json::Value weightNote(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_weight_note, null, data, null);
            return result;
        }

        /**
         * 磅单识别
         * 结构化识别磅单的车牌号、打印时间、毛重、皮重、净重、发货单位、收货单位、单号8个关键字段，现阶段仅支持识别印刷体磅单
         * @param url 图片完整URL路径
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页         * probability 是否返回字段识别结果的置信度，默认为 false，可缺省
                - false：不返回字段识别结果的置信度
                - true：返回字段识别结果的置信度，包括字段识别结果中各字符置信度的平均值（average）和最小值（min）
            
         */
        Json::Value weightNoteUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_weight_note, null, data, null);
            return result;
        }

        /**
         * 磅单识别
         * 结构化识别磅单的车牌号、打印时间、毛重、皮重、净重、发货单位、收货单位、单号8个关键字段，现阶段仅支持识别印刷体磅单
         * @param pdf_file 图片完整URL路径
         * options 可选参数:
         * pdf_file_num 需要识别的PDF文件的对应页码，当 pdf_file 参数有效时，识别传入页码的对应页面内容，若不传入，则默认识别第 1 页         * probability 是否返回字段识别结果的置信度，默认为 false，可缺省
                - false：不返回字段识别结果的置信度
                - true：返回字段识别结果的置信度，包括字段识别结果中各字符置信度的平均值（average）和最小值（min）
            
         */
        Json::Value weightNotePdf(
                std::string pdf_file,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_weight_note, null, data, null);
            return result;
        }

        /**
         * 医疗费用明细识别
         * 支持识别全国医疗费用明细的姓名、日期、病人ID、总金额等关键字段，支持识别费用明细项目清单，包含项目类型、项目名称、
        单价、数量、规格、金额，其中北京地区识别效果最佳。
    
         * @param image 二进制图像数据
         * options 可选参数:
         * location 是否返回字段的位置信息，默认为 false，可缺省
                - false：不返回字段位置信息
                - true：返回字段的位置信息，包括上边距（top）、左边距（left）、宽度（width）、高度（height）
                     * probability 是否返回字段识别结果的置信度，默认为 false，可缺省
                - false：不返回字段识别结果的置信度
                - true：返回字段识别结果的置信度，包括字段识别结果中各字符置信度的平均值（average）和最小值（min）
            
         */
        Json::Value medicalDetail(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_detail, null, data, null);
            return result;
        }

        /**
         * 医疗费用明细识别
         * 支持识别全国医疗费用明细的姓名、日期、病人ID、总金额等关键字段，支持识别费用明细项目清单，包含项目类型、项目名称、
        单价、数量、规格、金额，其中北京地区识别效果最佳。
    
         * @param url 图片完整URL路径
         * options 可选参数:
         * location 是否返回字段的位置信息，默认为 false，可缺省
                - false：不返回字段位置信息
                - true：返回字段的位置信息，包括上边距（top）、左边距（left）、宽度（width）、高度（height）
                     * probability 是否返回字段识别结果的置信度，默认为 false，可缺省
                - false：不返回字段识别结果的置信度
                - true：返回字段识别结果的置信度，包括字段识别结果中各字符置信度的平均值（average）和最小值（min）
            
         */
        Json::Value medicalDetailUrl(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_detail, null, data, null);
            return result;
        }


        /**
         * 彩票识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         * - recognize_granularity: 是否定位单字符位置，
         *  - big：不定位单字符位置，默认值
         *  - small：定位单字符位置
         */
        Json::Value lottery_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_lottery_v1, null, data, null);
            return result;
        }

        /**
         * 彩票识别
         * @param url 图像链接
         * @param options 可选参数:
         * - recognize_granularity: 是否定位单字符位置，
         *  - big：不定位单字符位置，默认值
         *  - small：定位单字符位置
         */
        Json::Value lottery_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_lottery_v1, null, data, null);
            return result;
        }

        /**
         * 保险单识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value insurance_documents_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_insurance_documents_v1, null, data, null);
            return result;
        }

        /**
         * 保险单识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value insurance_documents_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_insurance_documents_v1, null, data, null);
            return result;
        }

        /**
         * 台湾通行证识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value taiwan_exitentrypermit_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_taiwan_exitentrypermit_v1, null, data, null);
            return result;
        }

        /**
         * 台湾通行证识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value taiwan_exitentrypermit_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_taiwan_exitentrypermit_v1, null, data, null);
            return result;
        }

        /**
         * 港澳通行证识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value hk_macau_exitentrypermit_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_HK_Macau_exitentrypermit_v1, null, data, null);
            return result;
        }

        /**
         * 港澳通行证识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value hk_macau_exitentrypermit_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_HK_Macau_exitentrypermit_v1, null, data, null);
            return result;
        }


        /**
         * 出生医学证明识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value birth_certificate_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_birth_certificate_v1, null, data, null);
            return result;
        }

        /**
         * 出生医学证明识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value birth_certificate_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_birth_certificate_v1, null, data, null);
            return result;
        }

        /**
         * 名片识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value business_card_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_business_card_v1, null, data, null);
            return result;
        }

        /**
         * 名片识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value business_card_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_business_card_v1, null, data, null);
            return result;
        }

        /**
         * 定额发票识别
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value quota_invoice_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_quota_invoice_v1, null, data, null);
            return result;
        }

        /**
         * 定额发票识别
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value quota_invoice_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_quota_invoice_v1, null, data, null);
            return result;
        }

        /**
         * 定额发票识别
         * @param pdf_file 发票pdf文件二进制数据
         * options 可选参数:
         */
        Json::Value quota_invoice_v1_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_quota_invoice_v1, null, data, null);

            return result;
        }

        /**
         *  iOCR 通用版
         * @param image 二进制图像数据
         * @param options 可选参数:
         */
        Json::Value recognise_iocr_v1(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_v1, null, data, null);
            return result;
        }

        /**
         * iOCR 通用版
         * @param url 图像链接
         * @param options 可选参数:
         */
        Json::Value recognise_iocr_v1_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_v1, null, data, null);
            return result;
        }

        /**
         * iOCR 通用版
         * @param pdf_file 发票pdf文件二进制数据
         * options 可选参数:
         */
        Json::Value recognise_iocr_v1_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_v1, null, data, null);

            return result;
        }

        /**
         * iOCR自定义模板文字识别 - 财会版
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value custom_finance(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_finance, null, data, null);
            return result;
        }

        /**
         * iOCR自定义模板文字识别 - 财会版
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value custom_finance_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_finance, null, data, null);
            return result;
        }

        /**
         * iOCR自定义模板文字识别 - 财会版
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value custom_finance_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_recognise_iocr_finance, null, data, null);

            return result;
        }

        /**
         * 汽车票识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Kkblx01ww
         */
        Json::Value bus_ticket(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_bus_ticket, null, data, null);
            return result;
        }

        /**
         * 汽车票识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Kkblx01ww
         */
        Json::Value bus_ticket_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_bus_ticket, null, data, null);
            return result;
        }

        /**
         * 过路过桥费发票识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/1kbpyx8js
         */
        Json::Value toll_invoice(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_toll_invoice, null, data, null);
            return result;
        }

        /**
         * 过路过桥费发票识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/1kbpyx8js
         */
        Json::Value toll_invoice_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_toll_invoice, null, data, null);
            return result;
        }

        /**
         * 多卡证类别检测 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/nkbq6wxxy
         */
        Json::Value multi_card_classify(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_multi_card_classify, null, data, null);
            return result;
        }

        /**
         * 多卡证类别检测 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/nkbq6wxxy
         */
        Json::Value multi_card_classify_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_multi_card_classify, null, data, null);
            return result;
        }

        /**
         * 智能结构化识别 - image （注：已下线）
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Qke3nkykj
         */
        Json::Value intelligent_ocr(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_intelligent_ocr, null, data, null);
            return result;
        }

        /**
         * 智能结构化识别 - url （注：已下线）
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Qke3nkykj
         */
        Json::Value intelligent_ocr_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_intelligent_ocr, null, data, null);
            return result;
        }

        /**
         * 病案首页识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/1ke30k2s2
         */
        Json::Value medical_record(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_record, null, data, null);
            return result;
        }

        /**
         * 病案首页识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/1ke30k2s2
         */
        Json::Value medical_record_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_record, null, data, null);
            return result;
        }

        /**
         * 医疗费用结算单识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Jke30ki7d
         */
        Json::Value medical_statement(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_statement, null, data, null);
            return result;
        }

        /**
         * 医疗费用结算单识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Jke30ki7d
         */
        Json::Value medical_statement_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_statement, null, data, null);
            return result;
        }

        /**
         * 船票识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/nkmcwp3ne
         */
        Json::Value ferry_ticket(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_ferry_ticket, null, data, null);
            return result;
        }

        /**
         * 船票识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/nkmcwp3ne
         */
        Json::Value ferry_ticket_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_ferry_ticket, null, data, null);
            return result;
        }

        /**
         * 二手车销售发票识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/8knr8rrj8
         */
        Json::Value used_vehicle_invoice(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_used_vehicle_invoice, null, data, null);
            return result;
        }

        /**
         * 二手车销售发票识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/8knr8rrj8
         */
        Json::Value used_vehicle_invoice_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_used_vehicle_invoice, null, data, null);
            return result;
        }

        /**
         * 身份证混贴识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/akp3gfbmc
         */
        Json::Value multi_idcard(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_multi_idcard, null, data, null);
            return result;
        }

        /**
         * 身份证混贴识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/akp3gfbmc
         */
        Json::Value multi_idcard_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_multi_idcard, null, data, null);
            return result;
        }

        /**
         * 通信行程卡识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Nksg89dkc
         */
        Json::Value travel_card(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_travel_card, null, data, null);
            return result;
        }

        /**
         * 社保卡识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/lkto93055
         */
        Json::Value social_security_card(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_social_security_card, null, data, null);
            return result;
        }

        /**
         * 社保卡识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/lkto93055
         */
        Json::Value social_security_card_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_social_security_card, null, data, null);
            return result;
        }

        /**
         * 医疗检验报告单识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Ekvakju92
         */
        Json::Value medical_report_detection(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_report_detection, null, data, null);
            return result;
        }

        /**
         * 医疗检验报告单识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Ekvakju92
         */
        Json::Value medical_report_detection_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_report_detection, null, data, null);
            return result;
        }

        /**
         * 医疗票据类别检测 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/zkvriu3sh
         */
        Json::Value medical_recipts_classify(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_medical_recipts_classify, null, data, null);
            return result;
        }

        /**
         * 医疗票据类别检测 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/zkvriu3sh
         */
        Json::Value medical_recipts_classify_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_medical_recipts_classify, null, data, null);
            return result;
        }

        /**
         * 快递面单识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Ekwkggqa5
         */
        Json::Value waybill(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_waybill, null, data, null);
            return result;
        }

        /**
         * 快递面单识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Ekwkggqa5
         */
        Json::Value waybill_url(
                std::string url) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            Json::Value result =
                    this->request(_waybill, null, data, null);
            return result;
        }

        /**
         * 出院小结识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Wkwwy4y4q
         */
        Json::Value medical_summary(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_summary, null, data, null);
            return result;
        }

        /**
         * 出院小结识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Wkwwy4y4q
         */
        Json::Value medical_summary_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_summary, null, data, null);
            return result;
        }

        /**
         * 购物小票识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/3kwvk8y36
         */
        Json::Value shopping_receipt(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_shopping_receipt, null, data, null);
            return result;
        }

        /**
         * 购物小票识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/3kwvk8y36
         */
        Json::Value shopping_receipt_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_shopping_receipt, null, data, null);
            return result;
        }

        /**
         * 购物小票识别 - pdf
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/3kwvk8y36
         */
        Json::Value shopping_receipt_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_shopping_receipt, null, data, null);

            return result;
        }

        /**
         * 道路运输证识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/ol07rjylw
         */
        Json::Value road_transport_certificate(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_road_transport_certificate, null, data, null);
            return result;
        }

        /**
         * 道路运输证识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/ol07rjylw
         */
        Json::Value road_transport_certificate_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_road_transport_certificate, null, data, null);
            return result;
        }

        /**
         * 道路运输证识别 - pdf
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/ol07rjylw
         */
        Json::Value road_transport_certificate_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_road_transport_certificate, null, data, null);

            return result;
        }

        /**
         * 表格文字识别V2 - image
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value table(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_table, null, data, null);
            return result;
        }

        /**
         * 表格文字识别V2 - url
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value table_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_table, null, data, null);
            return result;
        }

        /**
         * 表格文字识别V2 - pdf
         * 参数详情参考：https://cloud.baidu.com/doc/OCR/s/yk3h7y9u3
         */
        Json::Value table_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_table, null, data, null);

            return result;
        }

        /**
         * 文档去手写 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/il4tb1jay
         */
        Json::Value remove_handwriting(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_remove_handwriting, null, data, null);
            return result;
        }

        /**
         * 文档去手写 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/il4tb1jay
         */
        Json::Value remove_handwriting_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_remove_handwriting, null, data, null);
            return result;
        }

        /**
         * 文档去手写 - pdf
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/il4tb1jay
         */
        Json::Value remove_handwriting_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_remove_handwriting, null, data, null);

            return result;
        }

        /**
         * 文档矫正增强 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Hl4taza5f
         */
        Json::Value doc_crop_enhance(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_doc_crop_enhance, null, data, null);
            return result;
        }

        /**
         * 文档矫正增强 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Hl4taza5f
         */
        Json::Value doc_crop_enhance_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_doc_crop_enhance, null, data, null);
            return result;
        }

        /**
         * 文档矫正增强 - pdf
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Hl4taza5f
         */
        Json::Value doc_crop_enhance_pdf(
                std::string const &pdf_file,
                const std::map<std::string, std::string> &options) {
            std::map<std::string, std::string> data;

            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_doc_crop_enhance, null, data, null);

            return result;
        }

        /**
         * 健康码识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Ol52hedan
         */
        Json::Value health_code(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_health_code, null, data, null);
            return result;
        }

        /**
         * 核酸证明识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/nl56ibk44
         */
        Json::Value covid_test(
                std::string image) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            Json::Value result =
                    this->request(_covid_test, null, data, null);
            return result;
        }

        /**
         * 处方笺识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Pl59exph0
         */
        Json::Value medical_prescription(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_prescription, null, data, null);
            return result;
        }

        /**
         * 处方笺识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Pl59exph0
         */
        Json::Value medical_prescription_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_prescription, null, data, null);
            return result;
        }

        /**
         * 门诊病历识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/ll59eepzw
         */
        Json::Value medical_outpatient(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_outpatient, null, data, null);
            return result;
        }

        /**
         * 门诊病历识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/ll59eepzw
         */
        Json::Value medical_outpatient_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_outpatient, null, data, null);
            return result;
        }

        /**
         * 诊断证明识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Dl59e3ohe
         */
        Json::Value medical_summary_diagnosis(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_summary_diagnosis, null, data, null);
            return result;
        }

        /**
         * 诊断证明识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Dl59e3ohe
         */
        Json::Value medical_summary_diagnosis_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_medical_summary_diagnosis, null, data, null);
            return result;
        }

        /**
         * 医疗诊断报告单识别 - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/El59es47z
         */
        Json::Value health_report(
                std::string image,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_health_report, null, data, null);
            return result;
        }

        /**
         * 医疗诊断报告单识别 - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/El59es47z
         */
        Json::Value health_report_url(
                std::string url,
                std::map<std::string, std::string> options) {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_health_report, null, data, null);
            return result;
        }

        /**
         * 图文转换器（接口版） - image
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Elf3sp7cz
         */
        Json::Value doc_convert_request_v1(
                std::string const &image,
                const Json::Value &options) {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_doc_convert_request_v1, data, &headers);
            return result;
        }

        /**
         * 图文转换器（接口版） - url
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Elf3sp7cz
         */
        Json::Value doc_convert_request_v1_url(
                std::string const &url,
                const Json::Value &options) {
            Json::Value data;
            data["url"] = url;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_doc_convert_request_v1, data, &headers);
            return result;
        }

        /**
         * 图文转换器（接口版） - pdf
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Elf3sp7cz
         */
        Json::Value doc_convert_request_v1_pdf(
                std::string const &pdf_file,
                const Json::Value &options) {
            Json::Value data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_doc_convert_request_v1, data, &headers);
            return result;
        }

        /**
         * 图文转换器（接口版） - 获取结果
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Elf3sp7cz
         */
        Json::Value doc_convert_result_v1(std::string const &task_id) {
            Json::Value data;
            data["task_id"] = task_id;

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_doc_convert_result_v1, data, &headers);
            return result;
        }

        /**
         * 银行回单识别
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Plep1yzi9
         */
        Json::Value bank_receipt_new(
                std::string const &image,
                const Json::Value &options) {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_bank_receipt_new, data, &headers);
            return result;
        }

        /**
         * 银行回单识别
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Plep1yzi9
         */
        Json::Value bank_receipt_new_url(
                std::string const &url,
                const Json::Value &options) {
            Json::Value data;
            data["url"] = url;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_bank_receipt_new, data, &headers);
            return result;
        }

        /**
         * 银行回单识别
         * 参数详情参考：https://ai.baidu.com/ai-doc/OCR/Plep1yzi9
         */
        Json::Value bank_receipt_new_pdf(
                std::string const &pdf_file,
                const Json::Value &options) {
            Json::Value data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_bank_receipt_new, data, &headers);
            return result;
        }

        /**
         * 结婚证识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Klg67mfkc
         */
        Json::Value marriage_certificate(
                std::string const & image,
                const Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_marriage_certificate, data, &headers);
            return result;
        }

        /**
         * 结婚证识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Klg67mfkc
         */
        Json::Value marriage_certificate_url(
                std::string const & url,
                const Json::Value & options)
        {
            Json::Value data;
            data["url"] = url;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_marriage_certificate, data, &headers);
            return result;
        }
        /**
         * 结婚证识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Klg67mfkc
         */
        Json::Value marriage_certificate_pdf(
                std::string const & pdf_file,
                const Json::Value & options)
        {
            Json::Value data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_marriage_certificate, data, &headers);
            return result;
        }

        /**
         * 港澳台证件识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Tlg6859ns
         */
        Json::Value hk_macau_taiwan_exitentrypermit(
                std::string const & image,
                std::string const & exitentrypermit_type,
                const Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["exitentrypermit_type"] = exitentrypermit_type;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_hk_macau_taiwan_exitentrypermit, data, &headers);
            return result;
        }

        /**
         * 港澳台证件识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Tlg6859ns
         */
        Json::Value hk_macau_taiwan_exitentrypermit_url(
                std::string const & url,
                std::string const & exitentrypermit_type,
                const Json::Value & options)
        {
            Json::Value data;
            data["url"] = url;
            data["exitentrypermit_type"] = exitentrypermit_type;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_hk_macau_taiwan_exitentrypermit, data, &headers);
            return result;
        }
        /**
         * 港澳台证件识别
         * 参数详情参考: https://ai.baidu.com/ai-doc/OCR/Tlg6859ns
         */
        Json::Value hk_macau_taiwan_exitentrypermit_pdf(
                std::string const & pdf_file,
                std::string const & exitentrypermit_type,
                const Json::Value & options)
        {
            Json::Value data;
            data["pdf_file"] = base64_encode(pdf_file.c_str(), (int) pdf_file.size());
            data["exitentrypermit_type"] = exitentrypermit_type;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_hk_macau_taiwan_exitentrypermit, data, &headers);
            return result;
        }
    };
}
#endif
