// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: speech_recognition.proto

#ifndef PROTOBUF_INCLUDED_speech_5frecognition_2eproto
#define PROTOBUF_INCLUDED_speech_5frecognition_2eproto

#include <string>

#include <google/protobuf/stubs/common.h>

#if GOOGLE_PROTOBUF_VERSION < 3006001
#error This file was generated by a newer version of protoc which is
#error incompatible with your Protocol Buffer headers.  Please update
#error your headers.
#endif
#if 3006001 < GOOGLE_PROTOBUF_MIN_PROTOC_VERSION
#error This file was generated by an older version of protoc which is
#error incompatible with your Protocol Buffer headers.  Please
#error regenerate this file with a newer version of protoc.
#endif

#include <google/protobuf/io/coded_stream.h>
#include <google/protobuf/arena.h>
#include <google/protobuf/arenastring.h>
#include <google/protobuf/generated_message_table_driven.h>
#include <google/protobuf/generated_message_util.h>
#include <google/protobuf/inlined_string_field.h>
#include <google/protobuf/metadata.h>
#include <google/protobuf/message.h>
#include <google/protobuf/repeated_field.h>  // IWYU pragma: export
#include <google/protobuf/extension_set.h>  // IWYU pragma: export
#include <google/protobuf/service.h>
#include <google/protobuf/unknown_field_set.h>
// @@protoc_insertion_point(includes)
#define PROTOBUF_INTERNAL_EXPORT_protobuf_speech_5frecognition_2eproto 

namespace protobuf_speech_5frecognition_2eproto {
// Internal implementation detail -- do not use these members.
struct TableStruct {
  static const ::google::protobuf::internal::ParseTableField entries[];
  static const ::google::protobuf::internal::AuxillaryParseTableField aux[];
  static const ::google::protobuf::internal::ParseTable schema[2];
  static const ::google::protobuf::internal::FieldMetadata field_metadata[];
  static const ::google::protobuf::internal::SerializationTable serialization_table[];
  static const ::google::protobuf::uint32 offsets[];
};
void AddDescriptors();
}  // namespace protobuf_speech_5frecognition_2eproto
namespace chen_im {
class SpeechRecognitionReq;
class SpeechRecognitionReqDefaultTypeInternal;
extern SpeechRecognitionReqDefaultTypeInternal _SpeechRecognitionReq_default_instance_;
class SpeechRecognitionRsp;
class SpeechRecognitionRspDefaultTypeInternal;
extern SpeechRecognitionRspDefaultTypeInternal _SpeechRecognitionRsp_default_instance_;
}  // namespace chen_im
namespace google {
namespace protobuf {
template<> ::chen_im::SpeechRecognitionReq* Arena::CreateMaybeMessage<::chen_im::SpeechRecognitionReq>(Arena*);
template<> ::chen_im::SpeechRecognitionRsp* Arena::CreateMaybeMessage<::chen_im::SpeechRecognitionRsp>(Arena*);
}  // namespace protobuf
}  // namespace google
namespace chen_im {

// ===================================================================

class SpeechRecognitionReq : public ::google::protobuf::Message /* @@protoc_insertion_point(class_definition:chen_im.SpeechRecognitionReq) */ {
 public:
  SpeechRecognitionReq();
  virtual ~SpeechRecognitionReq();

  SpeechRecognitionReq(const SpeechRecognitionReq& from);

  inline SpeechRecognitionReq& operator=(const SpeechRecognitionReq& from) {
    CopyFrom(from);
    return *this;
  }
  #if LANG_CXX11
  SpeechRecognitionReq(SpeechRecognitionReq&& from) noexcept
    : SpeechRecognitionReq() {
    *this = ::std::move(from);
  }

  inline SpeechRecognitionReq& operator=(SpeechRecognitionReq&& from) noexcept {
    if (GetArenaNoVirtual() == from.GetArenaNoVirtual()) {
      if (this != &from) InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }
  #endif
  static const ::google::protobuf::Descriptor* descriptor();
  static const SpeechRecognitionReq& default_instance();

  static void InitAsDefaultInstance();  // FOR INTERNAL USE ONLY
  static inline const SpeechRecognitionReq* internal_default_instance() {
    return reinterpret_cast<const SpeechRecognitionReq*>(
               &_SpeechRecognitionReq_default_instance_);
  }
  static constexpr int kIndexInFileMessages =
    0;

  void Swap(SpeechRecognitionReq* other);
  friend void swap(SpeechRecognitionReq& a, SpeechRecognitionReq& b) {
    a.Swap(&b);
  }

  // implements Message ----------------------------------------------

  inline SpeechRecognitionReq* New() const final {
    return CreateMaybeMessage<SpeechRecognitionReq>(NULL);
  }

  SpeechRecognitionReq* New(::google::protobuf::Arena* arena) const final {
    return CreateMaybeMessage<SpeechRecognitionReq>(arena);
  }
  void CopyFrom(const ::google::protobuf::Message& from) final;
  void MergeFrom(const ::google::protobuf::Message& from) final;
  void CopyFrom(const SpeechRecognitionReq& from);
  void MergeFrom(const SpeechRecognitionReq& from);
  void Clear() final;
  bool IsInitialized() const final;

  size_t ByteSizeLong() const final;
  bool MergePartialFromCodedStream(
      ::google::protobuf::io::CodedInputStream* input) final;
  void SerializeWithCachedSizes(
      ::google::protobuf::io::CodedOutputStream* output) const final;
  ::google::protobuf::uint8* InternalSerializeWithCachedSizesToArray(
      bool deterministic, ::google::protobuf::uint8* target) const final;
  int GetCachedSize() const final { return _cached_size_.Get(); }

  private:
  void SharedCtor();
  void SharedDtor();
  void SetCachedSize(int size) const final;
  void InternalSwap(SpeechRecognitionReq* other);
  private:
  inline ::google::protobuf::Arena* GetArenaNoVirtual() const {
    return NULL;
  }
  inline void* MaybeArenaPtr() const {
    return NULL;
  }
  public:

  ::google::protobuf::Metadata GetMetadata() const final;

  // nested types ----------------------------------------------------

  // accessors -------------------------------------------------------

  // string request_id = 1;
  void clear_request_id();
  static const int kRequestIdFieldNumber = 1;
  const ::std::string& request_id() const;
  void set_request_id(const ::std::string& value);
  #if LANG_CXX11
  void set_request_id(::std::string&& value);
  #endif
  void set_request_id(const char* value);
  void set_request_id(const char* value, size_t size);
  ::std::string* mutable_request_id();
  ::std::string* release_request_id();
  void set_allocated_request_id(::std::string* request_id);

  // bytes speech_content = 2;
  void clear_speech_content();
  static const int kSpeechContentFieldNumber = 2;
  const ::std::string& speech_content() const;
  void set_speech_content(const ::std::string& value);
  #if LANG_CXX11
  void set_speech_content(::std::string&& value);
  #endif
  void set_speech_content(const char* value);
  void set_speech_content(const void* value, size_t size);
  ::std::string* mutable_speech_content();
  ::std::string* release_speech_content();
  void set_allocated_speech_content(::std::string* speech_content);

  // string user_id = 3;
  void clear_user_id();
  static const int kUserIdFieldNumber = 3;
  const ::std::string& user_id() const;
  void set_user_id(const ::std::string& value);
  #if LANG_CXX11
  void set_user_id(::std::string&& value);
  #endif
  void set_user_id(const char* value);
  void set_user_id(const char* value, size_t size);
  ::std::string* mutable_user_id();
  ::std::string* release_user_id();
  void set_allocated_user_id(::std::string* user_id);

  // string session_id = 4;
  void clear_session_id();
  static const int kSessionIdFieldNumber = 4;
  const ::std::string& session_id() const;
  void set_session_id(const ::std::string& value);
  #if LANG_CXX11
  void set_session_id(::std::string&& value);
  #endif
  void set_session_id(const char* value);
  void set_session_id(const char* value, size_t size);
  ::std::string* mutable_session_id();
  ::std::string* release_session_id();
  void set_allocated_session_id(::std::string* session_id);

  // @@protoc_insertion_point(class_scope:chen_im.SpeechRecognitionReq)
 private:

  ::google::protobuf::internal::InternalMetadataWithArena _internal_metadata_;
  ::google::protobuf::internal::ArenaStringPtr request_id_;
  ::google::protobuf::internal::ArenaStringPtr speech_content_;
  ::google::protobuf::internal::ArenaStringPtr user_id_;
  ::google::protobuf::internal::ArenaStringPtr session_id_;
  mutable ::google::protobuf::internal::CachedSize _cached_size_;
  friend struct ::protobuf_speech_5frecognition_2eproto::TableStruct;
};
// -------------------------------------------------------------------

class SpeechRecognitionRsp : public ::google::protobuf::Message /* @@protoc_insertion_point(class_definition:chen_im.SpeechRecognitionRsp) */ {
 public:
  SpeechRecognitionRsp();
  virtual ~SpeechRecognitionRsp();

  SpeechRecognitionRsp(const SpeechRecognitionRsp& from);

  inline SpeechRecognitionRsp& operator=(const SpeechRecognitionRsp& from) {
    CopyFrom(from);
    return *this;
  }
  #if LANG_CXX11
  SpeechRecognitionRsp(SpeechRecognitionRsp&& from) noexcept
    : SpeechRecognitionRsp() {
    *this = ::std::move(from);
  }

  inline SpeechRecognitionRsp& operator=(SpeechRecognitionRsp&& from) noexcept {
    if (GetArenaNoVirtual() == from.GetArenaNoVirtual()) {
      if (this != &from) InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }
  #endif
  static const ::google::protobuf::Descriptor* descriptor();
  static const SpeechRecognitionRsp& default_instance();

  static void InitAsDefaultInstance();  // FOR INTERNAL USE ONLY
  static inline const SpeechRecognitionRsp* internal_default_instance() {
    return reinterpret_cast<const SpeechRecognitionRsp*>(
               &_SpeechRecognitionRsp_default_instance_);
  }
  static constexpr int kIndexInFileMessages =
    1;

  void Swap(SpeechRecognitionRsp* other);
  friend void swap(SpeechRecognitionRsp& a, SpeechRecognitionRsp& b) {
    a.Swap(&b);
  }

  // implements Message ----------------------------------------------

  inline SpeechRecognitionRsp* New() const final {
    return CreateMaybeMessage<SpeechRecognitionRsp>(NULL);
  }

  SpeechRecognitionRsp* New(::google::protobuf::Arena* arena) const final {
    return CreateMaybeMessage<SpeechRecognitionRsp>(arena);
  }
  void CopyFrom(const ::google::protobuf::Message& from) final;
  void MergeFrom(const ::google::protobuf::Message& from) final;
  void CopyFrom(const SpeechRecognitionRsp& from);
  void MergeFrom(const SpeechRecognitionRsp& from);
  void Clear() final;
  bool IsInitialized() const final;

  size_t ByteSizeLong() const final;
  bool MergePartialFromCodedStream(
      ::google::protobuf::io::CodedInputStream* input) final;
  void SerializeWithCachedSizes(
      ::google::protobuf::io::CodedOutputStream* output) const final;
  ::google::protobuf::uint8* InternalSerializeWithCachedSizesToArray(
      bool deterministic, ::google::protobuf::uint8* target) const final;
  int GetCachedSize() const final { return _cached_size_.Get(); }

  private:
  void SharedCtor();
  void SharedDtor();
  void SetCachedSize(int size) const final;
  void InternalSwap(SpeechRecognitionRsp* other);
  private:
  inline ::google::protobuf::Arena* GetArenaNoVirtual() const {
    return NULL;
  }
  inline void* MaybeArenaPtr() const {
    return NULL;
  }
  public:

  ::google::protobuf::Metadata GetMetadata() const final;

  // nested types ----------------------------------------------------

  // accessors -------------------------------------------------------

  // string request_id = 1;
  void clear_request_id();
  static const int kRequestIdFieldNumber = 1;
  const ::std::string& request_id() const;
  void set_request_id(const ::std::string& value);
  #if LANG_CXX11
  void set_request_id(::std::string&& value);
  #endif
  void set_request_id(const char* value);
  void set_request_id(const char* value, size_t size);
  ::std::string* mutable_request_id();
  ::std::string* release_request_id();
  void set_allocated_request_id(::std::string* request_id);

  // string errmsg = 3;
  void clear_errmsg();
  static const int kErrmsgFieldNumber = 3;
  const ::std::string& errmsg() const;
  void set_errmsg(const ::std::string& value);
  #if LANG_CXX11
  void set_errmsg(::std::string&& value);
  #endif
  void set_errmsg(const char* value);
  void set_errmsg(const char* value, size_t size);
  ::std::string* mutable_errmsg();
  ::std::string* release_errmsg();
  void set_allocated_errmsg(::std::string* errmsg);

  // string recognition_result = 4;
  void clear_recognition_result();
  static const int kRecognitionResultFieldNumber = 4;
  const ::std::string& recognition_result() const;
  void set_recognition_result(const ::std::string& value);
  #if LANG_CXX11
  void set_recognition_result(::std::string&& value);
  #endif
  void set_recognition_result(const char* value);
  void set_recognition_result(const char* value, size_t size);
  ::std::string* mutable_recognition_result();
  ::std::string* release_recognition_result();
  void set_allocated_recognition_result(::std::string* recognition_result);

  // bool success = 2;
  void clear_success();
  static const int kSuccessFieldNumber = 2;
  bool success() const;
  void set_success(bool value);

  // @@protoc_insertion_point(class_scope:chen_im.SpeechRecognitionRsp)
 private:

  ::google::protobuf::internal::InternalMetadataWithArena _internal_metadata_;
  ::google::protobuf::internal::ArenaStringPtr request_id_;
  ::google::protobuf::internal::ArenaStringPtr errmsg_;
  ::google::protobuf::internal::ArenaStringPtr recognition_result_;
  bool success_;
  mutable ::google::protobuf::internal::CachedSize _cached_size_;
  friend struct ::protobuf_speech_5frecognition_2eproto::TableStruct;
};
// ===================================================================

class SpeechService_Stub;

class SpeechService : public ::google::protobuf::Service {
 protected:
  // This class should be treated as an abstract interface.
  inline SpeechService() {};
 public:
  virtual ~SpeechService();

  typedef SpeechService_Stub Stub;

  static const ::google::protobuf::ServiceDescriptor* descriptor();

  virtual void SpeechRecognition(::google::protobuf::RpcController* controller,
                       const ::chen_im::SpeechRecognitionReq* request,
                       ::chen_im::SpeechRecognitionRsp* response,
                       ::google::protobuf::Closure* done);

  // implements Service ----------------------------------------------

  const ::google::protobuf::ServiceDescriptor* GetDescriptor();
  void CallMethod(const ::google::protobuf::MethodDescriptor* method,
                  ::google::protobuf::RpcController* controller,
                  const ::google::protobuf::Message* request,
                  ::google::protobuf::Message* response,
                  ::google::protobuf::Closure* done);
  const ::google::protobuf::Message& GetRequestPrototype(
    const ::google::protobuf::MethodDescriptor* method) const;
  const ::google::protobuf::Message& GetResponsePrototype(
    const ::google::protobuf::MethodDescriptor* method) const;

 private:
  GOOGLE_DISALLOW_EVIL_CONSTRUCTORS(SpeechService);
};

class SpeechService_Stub : public SpeechService {
 public:
  SpeechService_Stub(::google::protobuf::RpcChannel* channel);
  SpeechService_Stub(::google::protobuf::RpcChannel* channel,
                   ::google::protobuf::Service::ChannelOwnership ownership);
  ~SpeechService_Stub();

  inline ::google::protobuf::RpcChannel* channel() { return channel_; }

  // implements SpeechService ------------------------------------------

  void SpeechRecognition(::google::protobuf::RpcController* controller,
                       const ::chen_im::SpeechRecognitionReq* request,
                       ::chen_im::SpeechRecognitionRsp* response,
                       ::google::protobuf::Closure* done);
 private:
  ::google::protobuf::RpcChannel* channel_;
  bool owns_channel_;
  GOOGLE_DISALLOW_EVIL_CONSTRUCTORS(SpeechService_Stub);
};


// ===================================================================


// ===================================================================

#ifdef __GNUC__
  #pragma GCC diagnostic push
  #pragma GCC diagnostic ignored "-Wstrict-aliasing"
#endif  // __GNUC__
// SpeechRecognitionReq

// string request_id = 1;
inline void SpeechRecognitionReq::clear_request_id() {
  request_id_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionReq::request_id() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionReq.request_id)
  return request_id_.GetNoArena();
}
inline void SpeechRecognitionReq::set_request_id(const ::std::string& value) {
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionReq.request_id)
}
#if LANG_CXX11
inline void SpeechRecognitionReq::set_request_id(::std::string&& value) {
  
  request_id_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionReq.request_id)
}
#endif
inline void SpeechRecognitionReq::set_request_id(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionReq.request_id)
}
inline void SpeechRecognitionReq::set_request_id(const char* value, size_t size) {
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionReq.request_id)
}
inline ::std::string* SpeechRecognitionReq::mutable_request_id() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionReq.request_id)
  return request_id_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionReq::release_request_id() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionReq.request_id)
  
  return request_id_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionReq::set_allocated_request_id(::std::string* request_id) {
  if (request_id != NULL) {
    
  } else {
    
  }
  request_id_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), request_id);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionReq.request_id)
}

// bytes speech_content = 2;
inline void SpeechRecognitionReq::clear_speech_content() {
  speech_content_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionReq::speech_content() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionReq.speech_content)
  return speech_content_.GetNoArena();
}
inline void SpeechRecognitionReq::set_speech_content(const ::std::string& value) {
  
  speech_content_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionReq.speech_content)
}
#if LANG_CXX11
inline void SpeechRecognitionReq::set_speech_content(::std::string&& value) {
  
  speech_content_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionReq.speech_content)
}
#endif
inline void SpeechRecognitionReq::set_speech_content(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  speech_content_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionReq.speech_content)
}
inline void SpeechRecognitionReq::set_speech_content(const void* value, size_t size) {
  
  speech_content_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionReq.speech_content)
}
inline ::std::string* SpeechRecognitionReq::mutable_speech_content() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionReq.speech_content)
  return speech_content_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionReq::release_speech_content() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionReq.speech_content)
  
  return speech_content_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionReq::set_allocated_speech_content(::std::string* speech_content) {
  if (speech_content != NULL) {
    
  } else {
    
  }
  speech_content_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), speech_content);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionReq.speech_content)
}

// string user_id = 3;
inline void SpeechRecognitionReq::clear_user_id() {
  user_id_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionReq::user_id() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionReq.user_id)
  return user_id_.GetNoArena();
}
inline void SpeechRecognitionReq::set_user_id(const ::std::string& value) {
  
  user_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionReq.user_id)
}
#if LANG_CXX11
inline void SpeechRecognitionReq::set_user_id(::std::string&& value) {
  
  user_id_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionReq.user_id)
}
#endif
inline void SpeechRecognitionReq::set_user_id(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  user_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionReq.user_id)
}
inline void SpeechRecognitionReq::set_user_id(const char* value, size_t size) {
  
  user_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionReq.user_id)
}
inline ::std::string* SpeechRecognitionReq::mutable_user_id() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionReq.user_id)
  return user_id_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionReq::release_user_id() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionReq.user_id)
  
  return user_id_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionReq::set_allocated_user_id(::std::string* user_id) {
  if (user_id != NULL) {
    
  } else {
    
  }
  user_id_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), user_id);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionReq.user_id)
}

// string session_id = 4;
inline void SpeechRecognitionReq::clear_session_id() {
  session_id_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionReq::session_id() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionReq.session_id)
  return session_id_.GetNoArena();
}
inline void SpeechRecognitionReq::set_session_id(const ::std::string& value) {
  
  session_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionReq.session_id)
}
#if LANG_CXX11
inline void SpeechRecognitionReq::set_session_id(::std::string&& value) {
  
  session_id_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionReq.session_id)
}
#endif
inline void SpeechRecognitionReq::set_session_id(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  session_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionReq.session_id)
}
inline void SpeechRecognitionReq::set_session_id(const char* value, size_t size) {
  
  session_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionReq.session_id)
}
inline ::std::string* SpeechRecognitionReq::mutable_session_id() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionReq.session_id)
  return session_id_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionReq::release_session_id() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionReq.session_id)
  
  return session_id_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionReq::set_allocated_session_id(::std::string* session_id) {
  if (session_id != NULL) {
    
  } else {
    
  }
  session_id_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), session_id);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionReq.session_id)
}

// -------------------------------------------------------------------

// SpeechRecognitionRsp

// string request_id = 1;
inline void SpeechRecognitionRsp::clear_request_id() {
  request_id_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionRsp::request_id() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionRsp.request_id)
  return request_id_.GetNoArena();
}
inline void SpeechRecognitionRsp::set_request_id(const ::std::string& value) {
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionRsp.request_id)
}
#if LANG_CXX11
inline void SpeechRecognitionRsp::set_request_id(::std::string&& value) {
  
  request_id_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionRsp.request_id)
}
#endif
inline void SpeechRecognitionRsp::set_request_id(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionRsp.request_id)
}
inline void SpeechRecognitionRsp::set_request_id(const char* value, size_t size) {
  
  request_id_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionRsp.request_id)
}
inline ::std::string* SpeechRecognitionRsp::mutable_request_id() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionRsp.request_id)
  return request_id_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionRsp::release_request_id() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionRsp.request_id)
  
  return request_id_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionRsp::set_allocated_request_id(::std::string* request_id) {
  if (request_id != NULL) {
    
  } else {
    
  }
  request_id_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), request_id);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionRsp.request_id)
}

// bool success = 2;
inline void SpeechRecognitionRsp::clear_success() {
  success_ = false;
}
inline bool SpeechRecognitionRsp::success() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionRsp.success)
  return success_;
}
inline void SpeechRecognitionRsp::set_success(bool value) {
  
  success_ = value;
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionRsp.success)
}

// string errmsg = 3;
inline void SpeechRecognitionRsp::clear_errmsg() {
  errmsg_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionRsp::errmsg() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionRsp.errmsg)
  return errmsg_.GetNoArena();
}
inline void SpeechRecognitionRsp::set_errmsg(const ::std::string& value) {
  
  errmsg_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionRsp.errmsg)
}
#if LANG_CXX11
inline void SpeechRecognitionRsp::set_errmsg(::std::string&& value) {
  
  errmsg_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionRsp.errmsg)
}
#endif
inline void SpeechRecognitionRsp::set_errmsg(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  errmsg_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionRsp.errmsg)
}
inline void SpeechRecognitionRsp::set_errmsg(const char* value, size_t size) {
  
  errmsg_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionRsp.errmsg)
}
inline ::std::string* SpeechRecognitionRsp::mutable_errmsg() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionRsp.errmsg)
  return errmsg_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionRsp::release_errmsg() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionRsp.errmsg)
  
  return errmsg_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionRsp::set_allocated_errmsg(::std::string* errmsg) {
  if (errmsg != NULL) {
    
  } else {
    
  }
  errmsg_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), errmsg);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionRsp.errmsg)
}

// string recognition_result = 4;
inline void SpeechRecognitionRsp::clear_recognition_result() {
  recognition_result_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& SpeechRecognitionRsp::recognition_result() const {
  // @@protoc_insertion_point(field_get:chen_im.SpeechRecognitionRsp.recognition_result)
  return recognition_result_.GetNoArena();
}
inline void SpeechRecognitionRsp::set_recognition_result(const ::std::string& value) {
  
  recognition_result_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:chen_im.SpeechRecognitionRsp.recognition_result)
}
#if LANG_CXX11
inline void SpeechRecognitionRsp::set_recognition_result(::std::string&& value) {
  
  recognition_result_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:chen_im.SpeechRecognitionRsp.recognition_result)
}
#endif
inline void SpeechRecognitionRsp::set_recognition_result(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  recognition_result_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:chen_im.SpeechRecognitionRsp.recognition_result)
}
inline void SpeechRecognitionRsp::set_recognition_result(const char* value, size_t size) {
  
  recognition_result_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:chen_im.SpeechRecognitionRsp.recognition_result)
}
inline ::std::string* SpeechRecognitionRsp::mutable_recognition_result() {
  
  // @@protoc_insertion_point(field_mutable:chen_im.SpeechRecognitionRsp.recognition_result)
  return recognition_result_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* SpeechRecognitionRsp::release_recognition_result() {
  // @@protoc_insertion_point(field_release:chen_im.SpeechRecognitionRsp.recognition_result)
  
  return recognition_result_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void SpeechRecognitionRsp::set_allocated_recognition_result(::std::string* recognition_result) {
  if (recognition_result != NULL) {
    
  } else {
    
  }
  recognition_result_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), recognition_result);
  // @@protoc_insertion_point(field_set_allocated:chen_im.SpeechRecognitionRsp.recognition_result)
}

#ifdef __GNUC__
  #pragma GCC diagnostic pop
#endif  // __GNUC__
// -------------------------------------------------------------------


// @@protoc_insertion_point(namespace_scope)

}  // namespace chen_im

// @@protoc_insertion_point(global_scope)

#endif  // PROTOBUF_INCLUDED_speech_5frecognition_2eproto
