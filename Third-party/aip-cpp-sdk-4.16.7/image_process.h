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

#ifndef __AIP_IMAGEPROCESS_H__
#define __AIP_IMAGEPROCESS_H__

#include "base/base.h"

namespace aip {

    class Imageprocess: public AipBase
    {
        
    public:
        std::string _image_definition_enhance =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/image_definition_enhance";

        std::string _sky_seg =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/sky_seg";

        std::string _image_tyle_trans =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/style_trans";

        std::string _selfie_anime =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/selfie_anime";

        std::string _color_enhance =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/color_enhance";

        std::string _image_inpainting =
            "https://aip.baidubce.com/rest/2.0/image-process/v1/inpainting";

        std::string _image_quality_enhance_v1 =
                "https://aip.baidubce.com/rest/2.0/image-process/v1/image_quality_enhance";

        std::string _contrast_enhance_v1 =
                "https://aip.baidubce.com/rest/2.0/image-process/v1/contrast_enhance";

        std::string _dehaze_v1 =
                "https://aip.baidubce.com/rest/2.0/image-process/v1/dehaze";

        std::string _colourize_v1 =
                "https://aip.baidubce.com/rest/2.0/image-process/v1/colourize";

        std::string _stretch_restore_v1 =
                "https://aip.baidubce.com/rest/2.0/image-process/v1/stretch_restore";

        std::string _remove_moire_v1 = "https://aip.baidubce.com/rest/2.0/image-process/v1/remove_moire";
        std::string _customize_stylization_v1 = 
            "https://aip.baidubce.com/rest/2.0/image-process/v1/customize_stylization";
        std::string _doc_repair_v1 = "https://aip.baidubce.com/rest/2.0/image-process/v1/doc_repair";
        std::string _denoise_v1 = "https://aip.baidubce.com/rest/2.0/image-process/v1/denoise";

        Imageprocess(const std::string & app_id, const std::string & ak, const std::string & sk):
            AipBase(app_id, ak, sk)
        {
        }

        /**
         * 图像修复
         * 去除图片中不需要的遮挡物，并用背景内容填充，提高图像质量。
         * @param image 二进制图像数据
         * @param rectangle 要去除的位置为规则矩形时，给出坐标信息.每个元素包含left, top, width, height，int 类型
         * options 可选参数:
         */
        Json::Value imageinpainting(
            std::string const & image,
            Json::Value & rectangle,
            std::map<std::string, std::string> options)
        {
            Json::Value data;
            std::string access_token = this->getAccessToken();
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["rectangle"] = rectangle;

            std::map< std::string,std::string >::iterator it ;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            std::string mid = "?access_token=";
            std::string url = _image_inpainting+mid+access_token;
            Json::Value result =
                this->request_com(url, data);

            return result;
        }

        /**
         * 图像修复
         * 去除图片中不需要的遮挡物，并用背景内容填充，提高图像质量。
         * @param image 二进制图像数据
         * @param rectangle 要去除的位置为规则矩形时，给出坐标信息.每个元素包含left, top, width, height，int 类型
         * options 可选参数:
         */
        Json::Value imageinpainting_url(
                std::string const & url,
                Json::Value & rectangle,
                std::map<std::string, std::string> options)
        {
            Json::Value data;
            data["url"] = url;
            data["rectangle"] = rectangle;

            std::map< std::string,std::string >::iterator it ;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            Json::Value result =
                    this->request_com(_image_inpainting, data);

            return result;
        }

        /**
         * 图像色彩增强
         * 可智能调节图片的色彩饱和度、亮度、对比度，使得图片内容细节、色彩更加逼真，可用于提升网站图片、手机相册图片、视频封面图片的质量
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value colorenhance(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_color_enhance, null, data, null);

            return result;
        }

        /**
         * 人像动漫化接口
         * 运用世界领先的对抗生成网络，结合人脸检测、头发分割、人像分割等技术，为用户量身定制千人千面的二次元动漫形象，并且可通过参数设置，生成戴口罩的二次元动漫人像
         * @param image 二进制图像数据
         * options 可选参数:
         * type anime或者anime_mask。前者生成二次元动漫图，后者生成戴口罩的二次元动漫人像
         * mask_id 在type参数填入anime_mask时生效，1～8之间的整数，用于指定所使用的口罩的编码。type参数没有填入anime_mask，或mask_id 为空时，生成不戴口罩的二次元动漫图。
         */
        Json::Value selfieanime(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_selfie_anime, null, data, null);

            return result;
        }

        /**
         * 图像风格转换
         * 可将图像转化成卡通画、铅笔画、彩色铅笔画，或者哥特油画、彩色糖块油画、呐喊油画、神奈川冲浪里油画、奇异油画、薰衣草油画等共计9种风格，可用于开展趣味活动，或集成到美图应用中对图像进行风格转换
         * @param image 二进制图像数据
         * @param option 转换的风格
         * options 可选参数:
         */
        Json::Value imagestyletrans(
            std::string const & image,
            std::string const & option,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["option"] = option;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_image_tyle_trans, null, data, null);

            return result;
        }

        /**
         * 天空分割
         * 可智能分割出天空边界位置，输出天空和其余背景的灰度图和二值图，可用于图像二次处理，进行天空替换、抠图等图片编辑场景。
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value skyseg(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_sky_seg, null, data, null);

            return result;
        }

        /**
         * 图像清晰增强
         * 对压缩后的模糊图像实现智能快速去噪，优化图像纹理细节，使画面更加自然清晰
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value imagedefinitionenhance(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_image_definition_enhance, null, data, null);

            return result;
        }

        /**
         * 图像风格转换
         * 图像风格转换
         * @param url 图片完整url
         * @param option 转换的风格
         * options 可选参数:
         */
        Json::Value imagestyletransurl(
            std::string const & url,
            std::string const & option,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;
            data["option"] = option;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_image_tyle_trans, null, data, null);

            return result;
        }

        /**
         * 图像色彩增强
         * @param url 图片完整url
         * options 可选参数:
         */
        Json::Value colorenhanceurl(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_color_enhance, null, data, null);

            return result;
        }

        /**
         * 人像动漫化接口
         * 人像动漫化接口
         * @param url 图片完整url
         * options 可选参数:
         * type anime或者anime_mask。前者生成二次元动漫图，后者生成戴口罩的二次元动漫人像
         * mask_id 在type参数填入anime_mask时生效，1～8之间的整数，用于指定所使用的口罩的编码。type参数没有填入anime_mask，或mask_id 为空时，生成不戴口罩的二次元动漫图。
         */
        Json::Value selfieanimeurl(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_selfie_anime, null, data, null);

            return result;
        }

        /**
         * 天空分割
         * @param url 图片完整url
         * options 可选参数:
         */
        Json::Value skysegurl(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_sky_seg, null, data, null);

            return result;
        }

        /**
         * 图像清晰增强
         * @param url 图片完整url
         * options 可选参数:
         */
        Json::Value imagedefinitionenhanceurl(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_image_definition_enhance, null, data, null);

            return result;
        }

        /**
         * 图像无损放大
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value image_quality_enhance_v1(
                std::string const & image,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_image_quality_enhance_v1, null, data, null);

            return result;
        }

        /**
        * 图像无损放大
        * @param url 图片完整url
        * options 可选参数:
        */
        Json::Value image_quality_enhance_v1_url(
                std::string const & url,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_image_quality_enhance_v1, null, data, null);

            return result;
        }

        /**
         * 图像对比度增强
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value contrast_enhance_v1(
                std::string const & image,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_contrast_enhance_v1, null, data, null);

            return result;
        }

        /**
        * 图像对比度增强
        * @param url 图片完整url
        * options 可选参数:
        */
        Json::Value contrast_enhance_v1_url(
                std::string const & url,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_contrast_enhance_v1, null, data, null);

            return result;
        }

        /**
         * 图像去雾
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value dehaze_v1(
                std::string const & image,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_dehaze_v1, null, data, null);

            return result;
        }

        /**
        * 图像去雾
        * @param url 图片完整url
        * options 可选参数:
        */
        Json::Value dehaze_v1_url(
                std::string const & url,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_dehaze_v1, null, data, null);

            return result;
        }

        /**
         * 黑白图像上色
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value colourize_v1(
                std::string const & image,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_colourize_v1, null, data, null);

            return result;
        }

        /**
        * 黑白图像上色
        * @param url 图片完整url
        * options 可选参数:
        */
        Json::Value colourize_v1_url(
                std::string const & url,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_colourize_v1, null, data, null);

            return result;
        }

        /**
         * 拉伸图像恢复
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value stretch_restore_v1(
                std::string const & image,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_stretch_restore_v1, null, data, null);

            return result;
        }

        /**
        * 拉伸图像恢复
        * @param url 图片完整url
        * options 可选参数:
        */
        Json::Value stretch_restore_v1_url(
                std::string const & url,
                const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                    this->request(_stretch_restore_v1, null, data, null);

            return result;
        }

        /**
         * 图片去摩尔纹
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/ql4wdlnc0
         */
        Json::Value remove_moire_v1(
            std::string const & image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_remove_moire_v1, null, data, null);

            return result;
        }

        /**
         * 图片去摩尔纹 - url
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/ql4wdlnc0
         */
        Json::Value remove_moire_v1_url(
            std::string const & url,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_remove_moire_v1, null, data, null);

            return result;
        }

         /**
         * 图片去摩尔纹 - pdf
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/ql4wdlnc0
         */
        Json::Value remove_moire_v1_pdf(
            std::string const & pdf,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["pdf_file"] = base64_encode(pdf.c_str(), (int) pdf.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_remove_moire_v1, null, data, null);

            return result;
        }


        /**
         * 图像风格自定义
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/al50vf6bq
         */
        Json::Value customize_stylization_v1(std::string const & image, Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_customize_stylization_v1, data, &headers);

            return result;
        }

        /**
         * 图像风格自定义 - url
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/al50vf6bq
         */
        Json::Value customize_stylization_v1_url(std::string const & url, Json::Value & options)
        {
            Json::Value data;
            data["url"] = url;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_customize_stylization_v1, data, &headers);

            return result;
        }

        /**
         * 文档图片去底纹
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/Nl6os53ab
         */
        Json::Value doc_repair_v1(
            std::string const & image,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_doc_repair_v1, null, data, null);

            return result;
        }

        /**
         * 文档图片去底纹 - url
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/Nl6os53ab
         */
        Json::Value doc_repair_v1_url(
            std::string const &url,
            const std::map<std::string, std::string> &options)
        {
            std::map<std::string, std::string> data;
            data["url"] = url;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));
            Json::Value result =
                this->request(_doc_repair_v1, null, data, null);

            return result;
        }

        /**
         * 图像去噪
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/Tl78sby7g
         */
        Json::Value denoise_v1(
            std::string const & image, int option)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["option"] = option;

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_denoise_v1, data, &headers);

            return result;
        }

        /**
         * 图像去噪 - url
         * 接口使用文档链接: https://ai.baidu.com/ai-doc/IMAGEPROCESS/Tl78sby7g
         */
        Json::Value denoise_v1_url(
            std::string const &url, int option)
        {
            Json::Value data;
            data["url"] = url;
            data["option"] = option;

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_denoise_v1, data, &headers);

            return result;
        }

    };
}
#endif
