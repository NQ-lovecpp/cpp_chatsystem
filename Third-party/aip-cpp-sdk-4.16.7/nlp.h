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

#ifndef __AIP_NLP_H__
#define __AIP_NLP_H__

#include "base/base.h"

namespace aip {

    class Nlp: public AipBase
    {
    public:
        
        std::string _lexer =
            "https://aip.baidubce.com/rpc/2.0/nlp/v1/lexer";
        
        std::string _wordembedding =
            "https://aip.baidubce.com/rpc/2.0/nlp/v2/word_emb_vec";
        
        std::string _depparser =
            "https://aip.baidubce.com/rpc/2.0/nlp/v1/depparser";
        
        std::string _dnnlm_cn =
            "https://aip.baidubce.com/rpc/2.0/nlp/v2/dnnlm_cn";
        
        std::string _word_sim_embedding =
            "https://aip.baidubce.com/rpc/2.0/nlp/v1/word_emb_sim";
        
        std::string _simnet =
            "https://aip.baidubce.com/rpc/2.0/nlp/v2/simnet";
        
        std::string _comment_tag =
            "https://aip.baidubce.com/rpc/2.0/nlp/v2/comment_tag";

        std::string _word_emb_sim_v2 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v2/word_emb_sim";

        std::string _sentiment_classify_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/sentiment_classify";

        std::string _lexer_custom_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/lexer_custom";

        std::string _keyword_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/keyword";

        std::string _topic_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/topic";

        std::string _ecnet_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/ecnet";

        std::string _emotion_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/emotion";

        std::string _news_summary_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/news_summary";

        std::string _address_v1 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/address";
        
        std::string _comment_tag_custom =
                "https://aip.baidubce.com/rpc/2.0/nlp/v2/comment_tag_custom";
        
        std::string _sentiment_classify_custom =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/sentiment_classify_custom";
        
        std::string _couplets =
                "https://aip.baidubce.com/rpc/2.0/creation/v1/couplets";
        
        std::string _poem =
                "https://aip.baidubce.com/rpc/2.0/creation/v1/poem";
        
        std::string _entity_level_sentiment =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment";
        
        std::string _entity_level_sentiment_add =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment/add";
        
        std::string _entity_level_sentiment_delete =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment/delete";
        
        std::string _entity_level_sentiment_delete_repo =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment/delete_repo";
        
        std::string _entity_level_sentiment_list =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment/list";
        
        std::string _entity_level_sentiment_query =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_level_sentiment/query";
        
        std::string _topic_phrase =
                "https://aip.baidubce.com/rpc/2.0/creation/v1/topic_phrase";
        
        std::string _recruitment_cvparser =
                "https://aip.baidubce.com/rpc/2.0/recruitment/v1/cvparser";
        
        std::string _recruitment_person_post =
                "https://aip.baidubce.com/rpc/2.0/recruitment/v1/person_post";
        
        std::string _recruitment_personas =
                "https://aip.baidubce.com/rpc/2.0/recruitment/v1/personas";
        
        std::string _titlepredictor =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/titlepredictor";
        
        std::string _depparser_v2 =
                "https://aip.baidubce.com/rpc/2.0/nlp/v2/depparser";
        
        std::string _bless_creation =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/bless_creation";
        
        std::string _entity_analysis =
                "https://aip.baidubce.com/rpc/2.0/nlp/v1/entity_analysis";

        std::string _text_correction =
                "https://aip.baidubce.com/rpc/2.0/nlp/v2/text_correction";
        
        Nlp(const std::string & app_id, const std::string & ak, const std::string & sk): AipBase(app_id, ak, sk)
        {
        }

        
        /**
         * lexer
         * 词法分析接口向用户提供分词、词性标注、专名识别三大功能；能够识别出文本串中的基本词汇（分词），对这些词汇进行重组、标注组合后词汇的词性，并进一步识别出命名实体。
         * @param text 待分析文本（目前仅支持UTF8编码），长度不超过65536字节
         * options 可选参数:
         */
        Json::Value lexer(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_lexer, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * wordembedding
         * 词向量表示接口提供中文词向量的查询功能。
         * @param word 文本内容（UTF8编码），最大64字节
         * options 可选参数:
         */
        Json::Value wordembedding(
            std::string const & word,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["word"] = word;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_wordembedding, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * depparser
         * 词向量表示接口提供中文词向量的查询功能。
         * @param text 待分析文本（目前仅支持UTF8编码），长度不超过256字节
         * options 可选参数:
         * mode 模型选择。默认值为0，可选值mode=0（对应web模型）；mode=1（对应query模型）
         */
        Json::Value depparser(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_depparser, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * dnnlm_cn
         * 中文DNN语言模型接口用于输出切词结果并给出每个词在句子中的概率值,判断一句话是否符合语言表达习惯。
         * @param text 文本内容（UTF8编码），最大10240字节，不需要切词
         * options 可选参数:
         */
        Json::Value dnnlm_cn(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_dnnlm_cn, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * word_sim_embedding
         * 输入两个词，得到两个词的相似度结果。
         * @param word_1 词1（UTF8编码），最大64字节
         * @param word_2 词1（UTF8编码），最大64字节
         * options 可选参数:
         * mode 预留字段，可选择不同的词义相似度模型。默认值为0，目前仅支持mode=0
         */
        Json::Value word_sim_embedding(
            std::string const & word_1,
            std::string const & word_2,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["word_1"] = word_1;
            data["word_2"] = word_2;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_word_sim_embedding, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * simnet
         * 短文本相似度接口用来判断两个文本的相似度得分。
         * @param text_1 待比较文本1（UTF8编码），最大512字节
         * @param text_2 待比较文本2（UTF8编码），最大512字节
         * options 可选参数:
         * model 默认为"BOW"，可选"BOW"、"CNN"与"GRNN"
         */
        Json::Value simnet(
            std::string const & text_1,
            std::string const & text_2,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text_1"] = text_1;
            data["text_2"] = text_2;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_simnet, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * comment_tag
         * 评论观点抽取接口用来提取一条评论句子的关注点和评论观点，并输出评论观点标签及评论观点极性。
         * @param text 评论内容（UTF8编码），最大10240字节
         * options 可选参数:
         * type 评论行业类型，默认为4（餐饮美食）
         */
        Json::Value comment_tag(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it=options.begin(); it!=options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_comment_tag, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 词义相似度
         * @param word_1 词1，最大64字节
         * @param word_2 词2，最大64字节
         * options 可选参数:
         */
        Json::Value word_emb_sim_v2(
                std::string const & word_1,
                std::string const & word_2,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["word_1"] = word_1;
            data["word_2"] = word_2;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            // 使用GBK编码
            std::map<std::string, std::string> headers;
            headers["charset"] = "GBK";

            Json::Value result =
                    this->request(_word_emb_sim_v2, null, data.toStyledString(), headers);

            return result;
        }

        /**
         * 情感倾向分析
         * @param text 文本内容，最大2048字节
         * options 可选参数:
         */
        Json::Value sentiment_classify_v1(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_sentiment_classify_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 词法分析(定制)
         * @param text 待分析文本，长度不超过20000字节
         * options 可选参数:
         */
        Json::Value lexer_custom_v1(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_lexer_custom_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 文章标签
         * @param title 文章标题，最大80字节
         * @param content 文章内容，最大65535字节
         * options 可选参数:
         */
        Json::Value keyword_v1(
                std::string const & title,
                std::string const & content,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["title"] = title;
            data["content"] = content;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_keyword_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 文章分类
         * @param title 文章标题，最大80字节
         * @param content 文章内容，最大65535字节
         * options 可选参数:
         */
        Json::Value topic_v1(
                std::string const & title,
                std::string const & content,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["title"] = title;
            data["content"] = content;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_topic_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 文本纠错
         * @param text 待纠错文本，输入限制550个汉字或英文
         * options 可选参数:
         */
        Json::Value ecnet_v1(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_ecnet_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 文本纠错-高级版
         * @param text 待纠错文本，输入限制550个汉字或英文
         * options 可选参数:
         */
        Json::Value text_correction(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_text_correction, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 对话情绪识别接口
         * @param text 待识别情感文本，输入限制512字节
         * options 可选参数:
         *  - scene 场景
         *      default（默认项-不区分场景），
         *      talk（闲聊对话-如度秘聊天等），
         *      task（任务型对话-如导航对话等），
         *      customer_service（客服对话-如电信/银行客服等）
         */
        Json::Value emotion_v1(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_emotion_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 新闻摘要
         * @param content 字符串仅支持GBK编码，长度需小于3000字符数（即6000字节）
         * @param max_summary_len 此数值将作为摘要结果的最大长度。
         * options 可选参数:
         *  - title: 字符串仅支持GBK编码，长度需小于200字符数
         */
        Json::Value news_summary_v1(
                std::string const & content,
                int max_summary_len,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["content"] = content;
            data["max_summary_len"] = max_summary_len;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_news_summary_v1, null, data.toStyledString(), null);

            return result;
        }

        /**
         * 地址识别
         * @param text 待识别的文本内容，不超过1000字节
         * options 可选参数:
         *  - confidence: 不设置时默认为-1
         */
        Json::Value address_v1(
                std::string const & text,
                const std::map<std::string, std::string> & options)
        {
            Json::Value data;

            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                    this->request(_address_v1, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 评论观点抽取「定制版」
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/ok6z52g8q
         */
        Json::Value comment_tag_custom(
                                       std::string const & text,
                                       const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;
            
            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            
            Json::Value result =
            this->request(_comment_tag_custom, null, data.toStyledString(), null);
            
            return result;
        }
        /**
         * 情感倾向分析「定制版」
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/zk6z52hds
         */
        Json::Value sentiment_classify_custom(
                                              std::string const & text,
                                              const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;
            
            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            
            Json::Value result =
            this->request(_sentiment_classify_custom, null, data.toStyledString(), null);
            
            return result;
        }
        
        /**
         * 智能春联
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Ok53wb6dh
         */
        Json::Value couplets(
                             std::string const & text,
                             const std::map<std::string, int> & options)
        {
            Json::Value data;
            
            data["text"] = text;
            
            std::map<std::string, int>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            
            Json::Value result =
            this->request(_couplets, null, data.toStyledString(), null);
            
            return result;
        }
        
        /**
         * 智能写诗
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/ak53wc3o3
         */
        Json::Value poem(
                         std::string const & text,
                         const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;
            
            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            
            Json::Value result =
            this->request(_poem, null, data.toStyledString(), null);
            
            return result;
        }
        
        /**
         * 实体抽取与情感倾向分析
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E4%B8%BB%E6%8E%A5%E5%8F%A3%EF%BC%88%E5%AE%9E%E4%BD%93%E6%8A%BD%E5%8F%96%E4%B8%8E%E6%83%85%E6%84%9F%E5%80%BE%E5%90%91%E5%88%86%E6%9E%90%EF%BC%89
         */
        Json::Value entity_level_sentiment(
                                           std::string const & title,
                                           std::string const & content,
                                           int const & type,
                                           const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["title"] = title;
            data["content"] = content;
            data["type"] = type;
            
            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }
            
            Json::Value result =
            this->request(_entity_level_sentiment, null, data.toStyledString(), null);
            
            return result;
        }
        
        /**
         * 实体库新增接口
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E5%AE%9E%E4%BD%93%E5%BA%93%E6%96%B0%E5%A2%9E%E6%8E%A5%E5%8F%A3
         */
        Json::Value entity_level_sentiment_add(
            std::string const & repository,
            std::vector<std::string> entities,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["repository"] = repository;
            Json::Value& en = data["entities"];
            int index{0};
            for (auto& e : entities)
                en[index++] = std::move(e);

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_entity_level_sentiment_add, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 实体名单删除接口
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E5%AE%9E%E4%BD%93%E5%90%8D%E5%8D%95%E5%88%A0%E9%99%A4%E6%8E%A5%E5%8F%A3
         */
        Json::Value entity_level_sentiment_delete(
            std::string const & repository,
            std::vector<std::string> entities,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["repository"] = repository;
            Json::Value& en = data["entities"];
            int index{0};
            for (auto& e : entities)
                en[index++] = std::move(e);

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_entity_level_sentiment_delete, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 实体库删除接口
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E5%AE%9E%E4%BD%93%E5%BA%93%E5%88%A0%E9%99%A4%E6%8E%A5%E5%8F%A3
         */
        Json::Value entity_level_sentiment_delete_repo(
            std::string const & repository,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["repository"] = repository;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_entity_level_sentiment_delete_repo, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 实体库查询接口
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E5%AE%9E%E4%BD%93%E5%BA%93%E6%9F%A5%E8%AF%A2%E6%8E%A5%E5%8F%A3
         */
        Json::Value entity_level_sentiment_list(
            const std::map<std::string, std::string> & options)
        {
            Json::Value data = {};

            Json::Value result =
                this->request(_entity_level_sentiment_list, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 实体名单查询接口
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Fk6z52g04#%E5%AE%9E%E4%BD%93%E5%90%8D%E5%8D%95%E6%9F%A5%E8%AF%A2%E6%8E%A5%E5%8F%A3
         */
        Json::Value entity_level_sentiment_query(
            std::string const & repository,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["repository"] = repository;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_entity_level_sentiment_query, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 文章主题短语生成
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/9k53w3qob
         */
        Json::Value topic_phrase(
            std::string const & title,
            std::string const & summary,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["title"] = title;
            data["summary"] = summary;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_topic_phrase, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 简历解析
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Xkahvfeqa
         */
        Json::Value recruitment_cvparser(
            const std::map<std::string, std::string> & resume)
        {
            Json::Value data;

            std::map<std::string, std::string>::const_iterator it;
            for(it = resume.begin(); it != resume.end(); it++)
            {
                data["resume"][it->first] = it->second;
            }

            Json::Value result =
                this->request(_recruitment_cvparser, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 人岗匹配
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/Pkahwzux5
         */
        Json::Value recruitment_person_post(
            const std::map<std::string, std::string> & resume,
            const std::map<std::string, std::string> & job_description)
        {
            Json::Value data;

            std::map<std::string, std::string>::const_iterator it_resume;
            for(it_resume = resume.begin(); it_resume != resume.end(); it_resume++)
            {
                data["resume"][it_resume->first] = it_resume->second;
            }
            
            std::map<std::string, std::string>::const_iterator it_job;
            for(it_job = job_description.begin(); it_job != job_description.end(); it_job++)
            {
                data["job_description"][it_job->first] = it_job->second;
            }

            Json::Value result =
                this->request(_recruitment_person_post, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 简历画像
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/5kc1kmz3w
         */
        Json::Value recruitment_personas(
            const std::map<std::string, std::string> & resume)
        {
            Json::Value data;

            std::map<std::string, std::string>::const_iterator it;
            for(it = resume.begin(); it != resume.end(); it++)
            {
                data["resume"][it->first] = it->second;
            }

            Json::Value result =
                this->request(_recruitment_personas, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 文章标题生成
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/0kvc1u1eg
         */
        Json::Value titlepredictor(
            std::string const & doc,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["doc"] = doc;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_titlepredictor, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 依存句法分析
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/nk6z52eu6
         */
        Json::Value depparser_v2(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            
            std::map<std::string, std::string> data;
            data["text"] = text;
            std::copy(options.begin(), options.end(), std::inserter(data, data.end()));

            Json::Value result =
                this->request(_depparser_v2, null, data, null);

            return result;
        }
        
        /**
         * 祝福语生成
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/sl4cg75jk
         */
        Json::Value bless_creation(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_bless_creation, null, data.toStyledString(), null);

            return result;
        }
        
        /**
         * 实体分析
         * 参数详情参考：https://ai.baidu.com/ai-doc/NLP/al631z295
         */
        Json::Value entity_analysis(
            std::string const & text,
            const std::map<std::string, std::string> & options)
        {
            Json::Value data;
            
            data["text"] = text;

            std::map<std::string, std::string>::const_iterator it;
            for(it = options.begin(); it != options.end(); it++)
            {
                data[it->first] = it->second;
            }

            Json::Value result =
                this->request(_entity_analysis, null, data.toStyledString(), null);

            return result;
        }
    };
}
#endif
