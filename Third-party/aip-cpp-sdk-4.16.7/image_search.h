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

#ifndef __AIP_IMAGESEARCH_H__
#define __AIP_IMAGESEARCH_H__

#include "base/base.h"

namespace aip {

    class Imagesearch: public AipBase
    {
    public:

        std::string _picturebook_search =
            "https://aip.baidubce.com/rest/2.0/imagesearch/v1/realtime_search/picturebook/search";
        
        std::string _picturebook_update =
            "https://aip.baidubce.com/rest/2.0/imagesearch/v1/realtime_search/picturebook/update";

        std::string _picturebook_add =
            "https://aip.baidubce.com/rest/2.0/imagesearch/v1/realtime_search/picturebook/add";
        
        std::string _picturebook_delete =
            "https://aip.baidubce.com/rest/2.0/imagesearch/v1/realtime_search/picturebook/delete";
        
        std::string _same_hq_add =
            "https://aip.baidubce.com/rest/2.0/realtime_search/same_hq/add";
        
        std::string _same_hq_search =
            "https://aip.baidubce.com/rest/2.0/realtime_search/same_hq/search";
        
        std::string _same_hq_delete =
            "https://aip.baidubce.com/rest/2.0/realtime_search/same_hq/delete";

        std::string _same_hq_update = 
            "https://aip.baidubce.com/rest/2.0/realtime_search/same_hq/update";
        
        std::string _similar_add =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/similar/add";
        
        std::string _similar_search =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/similar/search";
        
        std::string _similar_delete =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/similar/delete";

        std::string _similar_update = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/similar/update";
        
        std::string _product_add =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/product/add";
        
        std::string _product_search =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/product/search";
        
        std::string _product_delete =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/product/delete";

        std::string _product_update = 
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/product/update";
        
        std::string _materiel_add =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/materiel/add";
    
        std::string _materiel_search =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/materiel/search";
    
        std::string _materiel_delete =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/materiel/delete";

        std::string _materiel_update =
            "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/materiel/update";

        Imagesearch(const std::string & app_id, const std::string & ak, const std::string & sk): AipBase(app_id, ak, sk)
        {
        }
         
        /**
         * 面料入库
         * materiel_add
         * 文档参考：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E5%85%A5%E5%BA%93
         */
        Json::Value materiel_add(
            std::string const & image,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_add, null, data, null);

            return result;
        }

        /**
         * 面料入库
         * materiel_add
         * 文档参考：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E5%85%A5%E5%BA%93
         */
        Json::Value materiel_add_url(
            std::string const & url,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["url"] = url;
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_add, null, data, null);

            return result;
        }
        
         /**
         * 面料检索
         * materiel_search
         * 文档参考：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%A3%80%E7%B4%A2
         */
        Json::Value materiel_search(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_search, null, data, null);

            return result;
        }

        /**
         * 面料检索
         * materiel_search
         * 文档参考：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%A3%80%E7%B4%A2
         */
        Json::Value materiel_search_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_search, null, data, null);

            return result;
        }

        /**
         * 面料删除
         * materiel_delete_by_image
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E5%88%A0%E9%99%A4
         */
        Json::Value materiel_delete_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_delete, null, data, null);

            return result;
        }

        /**
         * 面料删除
         * materiel_delete_by_url
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E5%88%A0%E9%99%A4
         */
        Json::Value materiel_delete_by_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_delete, null, data, null);

            return result;
        }

       /**
         * 面料图片删除
         * materiel_delete_by_sign
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E5%88%A0%E9%99%A4
         */
        Json::Value materiel_delete_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_delete, null, data, null);

            return result;
        }

        /**
         * 面料更新
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value materiel_update(
            std::string const & image,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_update, null, data, null);

            return result;
        }

        /**
         * 面料更新
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value materiel_update_url(
            std::string const & url,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_update, null, data, null);

            return result;
        }

        /**
         * 面料更新
         * 参考文档：https://ai.baidu.com/ai-doc/IMAGESEARCH/kl6xkl6kq#%E9%9D%A2%E6%96%99%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value materiel_update_cont_sign(
            std::string const & cont_sign,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["cont_sign"] = cont_sign;
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_materiel_update, null, data, null);

            return result;
        }

        /**
         * same_hq_add
         * 该请求用于实时检索相同图片集合。即对于输入的一张图片（可正常解码，且长宽比适宜），返回自建图库中相同的图片集合。相同图检索包含入库、检索、删除三个子接口；**在正式使用之前请加入QQ群：649285136 联系工作人员完成建库并调用入库接口完成图片入库**。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * brief 检索时原样带回,最长256B。
         */
        Json::Value same_hq_add(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_add, null, data, null);

            return result;
        }
        
        /**
         * same_hq_search
         * 使用该接口前，请加入QQ群：649285136 ，联系工作人员完成建库。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value same_hq_search(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_search, null, data, null);

            return result;
        }
        
        /**
         * same_hq_delete_by_image
         * 删除相同图
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value same_hq_delete_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_delete, null, data, null);

            return result;
        }
        
        /**
         * same_hq_delete_by_sign
         * 删除相同图
         * @param cont_sign 图片签名（和image二选一，image优先级更高）
         * options 可选参数:
         */
        Json::Value same_hq_delete_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_delete, null, data, null);

            return result;
        }

        /**
         * 更新相同图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Ck3bczreq#%E7%9B%B8%E5%90%8C%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value same_hq_update_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_update, null, data, null);

            return result;
        }

        /**
         * 更新相同图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Ck3bczreq#%E7%9B%B8%E5%90%8C%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value same_hq_update_by_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_update, null, data, null);

            return result;
        }

        /**
         * 更新相同图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Ck3bczreq#%E7%9B%B8%E5%90%8C%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value same_hq_update_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_same_hq_update, null, data, null);

            return result;
        }
        
        /**
         * similar_add
         * 该请求用于实时检索相似图片集合。即对于输入的一张图片（可正常解码，且长宽比适宜），返回自建图库中相似的图片集合。相似图检索包含入库、检索、删除三个子接口；**在正式使用之前请加入QQ群：649285136 联系工作人员完成建库并调用入库接口完成图片入库**。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * brief 检索时原样带回,最长256B。
         */
        Json::Value similar_add(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_add, null, data, null);

            return result;
        }
        
        /**
         * similar_search
         * 使用该接口前，请加入QQ群：649285136 ，联系工作人员完成建库。
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value similar_search(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_search, null, data, null);

            return result;
        }
        
        /**
         * similar_delete_by_image
         * 删除相似图
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value similar_delete_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_delete, null, data, null);

            return result;
        }
        
        /**
         * similar_delete_by_sign
         * 删除相似图
         * @param cont_sign 图片签名（和image二选一，image优先级更高）
         * options 可选参数:
         */
        Json::Value similar_delete_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_delete, null, data, null);

            return result;
        }

        /**
         * 更新相似图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/3k3bczqz8#%E7%9B%B8%E4%BC%BC%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value similar_update_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_update, null, data, null);

            return result;
        }

        /**
         * 更新相似图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/3k3bczqz8#%E7%9B%B8%E4%BC%BC%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value similar_update_by_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_update, null, data, null);

            return result;
        }

        /**
         * 更新相似图
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/3k3bczqz8#%E7%9B%B8%E4%BC%BC%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value similar_update_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_similar_update, null, data, null);

            return result;
        }
        
        /**
         * product_add
         * 1、该请求用于实时检索商品类型图片相同或相似的图片集合，适用于电商平台或商品展示等场景，即对于输入的一张图片（可正常解码，且长宽比适宜），返回自建商品库中相同或相似的图片集合。
2、商品检索包含入库、检索、删除三个子接口；**在正式使用之前请在[控制台](https://console.bce.baidu.com/ai/#/ai/imagesearch/overview/index "控制台")创建应用后，在应用详情页申请建库，建库成功后方可正常使用入库、检索、删除三个接口**。

         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * brief 检索时原样带回,最长256B。**请注意，检索接口不返回原图，仅反馈当前填写的brief信息，所以调用该入库接口时，brief信息请尽量填写可关联至本地图库的图片id或者图片url、图片名称等信息**
         * class_id1 商品分类维度1，支持1-60范围内的整数。检索时可圈定该分类维度进行检索
         * class_id2 商品分类维度1，支持1-60范围内的整数。检索时可圈定该分类维度进行检索
         */
        Json::Value product_add(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_product_add, null, data, null);

            return result;
        }
        
        /**
         * product_search
         * 完成入库后，可使用该接口实现商品检索。
**请注意，检索接口不返回原图，仅反馈当前填写的brief信息，请调用入库接口时尽量填写可关联至本地图库的图片id或者图片url等信息**

         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         * class_id1 商品分类维度1，支持1-60范围内的整数。检索时可圈定该分类维度进行检索
         * class_id2 商品分类维度1，支持1-60范围内的整数。检索时可圈定该分类维度进行检索
         */
        Json::Value product_search(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_product_search, null, data, null);

            return result;
        }
        
        /**
         * product_delete_by_image
         * 删除商品
         * @param image 图像文件二进制内容，可以使用aip::get_file_content函数获取
         * options 可选参数:
         */
        Json::Value product_delete_by_image(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_product_delete, null, data, null);

            return result;
        }
        
        /**
         * product_delete_by_sign
         * 删除商品
         * @param cont_sign 图片签名（和image二选一，image优先级更高）
         * options 可选参数:
         */
        Json::Value product_delete_by_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;
            
            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_product_delete, null, data, null);

            return result;
        }

        /**
         * 更新商品搜索
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Dk3bczrmj#%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value product_update_by_image(
            std::string const & image,
            const Json::Value & options)
        {
            Json::Value data;
            data["image"] = base64_encode(image.c_str(), (int) image.size());
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_product_update, data, &headers);

            return result;
        }

        /**
         * 更新商品搜索
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Dk3bczrmj#%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value product_update_by_url(
            std::string const & url,
            const Json::Value & options)
        {
            Json::Value data;
            data["url"] = url;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_product_update, data, &headers);

            return result;
        }

        /**
         * 更新商品搜索
         * 使用文档链接: https://ai.baidu.com/ai-doc/IMAGESEARCH/Dk3bczrmj#%E5%95%86%E5%93%81%E5%9B%BE%E7%89%87%E6%90%9C%E7%B4%A2%E6%9B%B4%E6%96%B0
         */
        Json::Value product_update_by_sign(
            std::string const & cont_sign,
            const Json::Value & options)
        {
            Json::Value data;
            data["cont_sign"] = cont_sign;
            merge_json(data, options);

            std::map<std::string, std::string> headers;
            headers["Content-Type"] = "application/x-www-form-urlencoded";
            Json::Value result = this->request_com(_product_update, data, &headers);

            return result;
        }
        
        /**
         * 绘本入库
         * 该接口实现单张图片入库，入库时需要同步提交图片及可关联至本地图库的摘要信息
         * @param url 图像url
         * @param brief 检索时原样带回
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         */
        Json::Value picturebook_add_url(
            std::string const & url,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_add, null, data, null);

            return result;
        }

        /**
         * 绘本更新
         * 绘本图片更新
         * @param image 二进制图像数据
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         * brief 更新的摘要信息，最长256B。样例：{"name"
         */
        Json::Value picturebook_update(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_update, null, data, null);

            return result;
        }
        
        /**
         * 绘本图片删除
         * 删除图库中的图片
         * @param image 二进制图像数据
         * options 可选参数:
         */
        Json::Value picturebook_delete(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_delete, null, data, null);

            return result;
        }

        /**
         * 绘本图片删除
         * 完成入库后，可使用该接口实现绘本图删除
         * @param url 图片url
         * options 可选参数:
         */
        Json::Value picturebook_delete_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_delete, null, data, null);

            return result;
        }

        /**
         * 绘本更新
         * 绘本图片更新，通过图片签名
         * @param cont_sign 图片签名
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         * brief 更新的摘要信息，最长256B。样例：{"name"
         */
        Json::Value picturebook_update_cont_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_update, null, data, null);

            return result;
        }

        /**
         * 本图片搜索
         * 该接口实现单张图片入库，入库时需要同步提交图片及可关联至本地图库的摘要信息
         * @param image 二进制图像数据
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         * tag_logic 检索时tag之间的逻辑， 0：逻辑and，1：逻辑or
         */
        Json::Value picturebook_search(
            std::string const & image,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_search, null, data, null);

            return result;
        }
        
        /**
         * 绘本图片搜索
         * 完成入库后，可使用该接口实现绘本图检索
         * @param url 图片url
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         * tag_logic 检索时tag之间的逻辑， 0：逻辑and，1：逻辑or
         */
        Json::Value picturebook_search_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_search, null, data, null);

            return result;
        }

        /**
         * 绘本更新
         * 绘本图片更新
         * @param url 图片url
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         * brief 更新的摘要信息，最长256B。样例：{"name"
         */
        Json::Value picturebook_update_url(
            std::string const & url,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["url"] = url;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_update, null, data, null);

            return result;
        }
        
        /**
         * 绘本图片删除
         * 完成入库后，可使用该接口实现绘本图检索
         * @param cont_sign 图片签名
         * options 可选参数:
         */
        Json::Value picturebook_delete_cont_sign(
            std::string const & cont_sign,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["cont_sign"] = cont_sign;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_delete, null, data, null);

            return result;
        }
        
        /**
         * 绘本入库
         * 该接口实现单张图片入库，入库时需要同步提交图片及可关联至本地图库的摘要信息
         * @param image 二进制图像数据
         * @param brief 检索时原样带回
         * options 可选参数:
         * tags tag间以逗号分隔，最多2个tag，2个tag无层级关系，检索时支持逻辑运算
         */
        Json::Value picturebook_add(
            std::string const & image,
            std::string const & brief,
            const std::map<std::string, std::string> & options)
        {
            std::map<std::string, std::string> data;

            data["image"] = base64_encode(image.c_str(), (int) image.size());
            data["brief"] = brief;

            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_picturebook_add, null, data, null);

            return result;
        }


    };
}
#endif
