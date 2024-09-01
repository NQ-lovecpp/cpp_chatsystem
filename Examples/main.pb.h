// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: main.proto

#ifndef PROTOBUF_INCLUDED_main_2eproto
#define PROTOBUF_INCLUDED_main_2eproto

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
#define PROTOBUF_INTERNAL_EXPORT_protobuf_main_2eproto 

namespace protobuf_main_2eproto {
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
}  // namespace protobuf_main_2eproto
namespace example {
class EchoRequest;
class EchoRequestDefaultTypeInternal;
extern EchoRequestDefaultTypeInternal _EchoRequest_default_instance_;
class EchoResponse;
class EchoResponseDefaultTypeInternal;
extern EchoResponseDefaultTypeInternal _EchoResponse_default_instance_;
}  // namespace example
namespace google {
namespace protobuf {
template<> ::example::EchoRequest* Arena::CreateMaybeMessage<::example::EchoRequest>(Arena*);
template<> ::example::EchoResponse* Arena::CreateMaybeMessage<::example::EchoResponse>(Arena*);
}  // namespace protobuf
}  // namespace google
namespace example {

// ===================================================================

class EchoRequest : public ::google::protobuf::Message /* @@protoc_insertion_point(class_definition:example.EchoRequest) */ {
 public:
  EchoRequest();
  virtual ~EchoRequest();

  EchoRequest(const EchoRequest& from);

  inline EchoRequest& operator=(const EchoRequest& from) {
    CopyFrom(from);
    return *this;
  }
  #if LANG_CXX11
  EchoRequest(EchoRequest&& from) noexcept
    : EchoRequest() {
    *this = ::std::move(from);
  }

  inline EchoRequest& operator=(EchoRequest&& from) noexcept {
    if (GetArenaNoVirtual() == from.GetArenaNoVirtual()) {
      if (this != &from) InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }
  #endif
  static const ::google::protobuf::Descriptor* descriptor();
  static const EchoRequest& default_instance();

  static void InitAsDefaultInstance();  // FOR INTERNAL USE ONLY
  static inline const EchoRequest* internal_default_instance() {
    return reinterpret_cast<const EchoRequest*>(
               &_EchoRequest_default_instance_);
  }
  static constexpr int kIndexInFileMessages =
    0;

  void Swap(EchoRequest* other);
  friend void swap(EchoRequest& a, EchoRequest& b) {
    a.Swap(&b);
  }

  // implements Message ----------------------------------------------

  inline EchoRequest* New() const final {
    return CreateMaybeMessage<EchoRequest>(NULL);
  }

  EchoRequest* New(::google::protobuf::Arena* arena) const final {
    return CreateMaybeMessage<EchoRequest>(arena);
  }
  void CopyFrom(const ::google::protobuf::Message& from) final;
  void MergeFrom(const ::google::protobuf::Message& from) final;
  void CopyFrom(const EchoRequest& from);
  void MergeFrom(const EchoRequest& from);
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
  void InternalSwap(EchoRequest* other);
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

  // string message = 1;
  void clear_message();
  static const int kMessageFieldNumber = 1;
  const ::std::string& message() const;
  void set_message(const ::std::string& value);
  #if LANG_CXX11
  void set_message(::std::string&& value);
  #endif
  void set_message(const char* value);
  void set_message(const char* value, size_t size);
  ::std::string* mutable_message();
  ::std::string* release_message();
  void set_allocated_message(::std::string* message);

  // @@protoc_insertion_point(class_scope:example.EchoRequest)
 private:

  ::google::protobuf::internal::InternalMetadataWithArena _internal_metadata_;
  ::google::protobuf::internal::ArenaStringPtr message_;
  mutable ::google::protobuf::internal::CachedSize _cached_size_;
  friend struct ::protobuf_main_2eproto::TableStruct;
};
// -------------------------------------------------------------------

class EchoResponse : public ::google::protobuf::Message /* @@protoc_insertion_point(class_definition:example.EchoResponse) */ {
 public:
  EchoResponse();
  virtual ~EchoResponse();

  EchoResponse(const EchoResponse& from);

  inline EchoResponse& operator=(const EchoResponse& from) {
    CopyFrom(from);
    return *this;
  }
  #if LANG_CXX11
  EchoResponse(EchoResponse&& from) noexcept
    : EchoResponse() {
    *this = ::std::move(from);
  }

  inline EchoResponse& operator=(EchoResponse&& from) noexcept {
    if (GetArenaNoVirtual() == from.GetArenaNoVirtual()) {
      if (this != &from) InternalSwap(&from);
    } else {
      CopyFrom(from);
    }
    return *this;
  }
  #endif
  static const ::google::protobuf::Descriptor* descriptor();
  static const EchoResponse& default_instance();

  static void InitAsDefaultInstance();  // FOR INTERNAL USE ONLY
  static inline const EchoResponse* internal_default_instance() {
    return reinterpret_cast<const EchoResponse*>(
               &_EchoResponse_default_instance_);
  }
  static constexpr int kIndexInFileMessages =
    1;

  void Swap(EchoResponse* other);
  friend void swap(EchoResponse& a, EchoResponse& b) {
    a.Swap(&b);
  }

  // implements Message ----------------------------------------------

  inline EchoResponse* New() const final {
    return CreateMaybeMessage<EchoResponse>(NULL);
  }

  EchoResponse* New(::google::protobuf::Arena* arena) const final {
    return CreateMaybeMessage<EchoResponse>(arena);
  }
  void CopyFrom(const ::google::protobuf::Message& from) final;
  void MergeFrom(const ::google::protobuf::Message& from) final;
  void CopyFrom(const EchoResponse& from);
  void MergeFrom(const EchoResponse& from);
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
  void InternalSwap(EchoResponse* other);
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

  // string message = 1;
  void clear_message();
  static const int kMessageFieldNumber = 1;
  const ::std::string& message() const;
  void set_message(const ::std::string& value);
  #if LANG_CXX11
  void set_message(::std::string&& value);
  #endif
  void set_message(const char* value);
  void set_message(const char* value, size_t size);
  ::std::string* mutable_message();
  ::std::string* release_message();
  void set_allocated_message(::std::string* message);

  // @@protoc_insertion_point(class_scope:example.EchoResponse)
 private:

  ::google::protobuf::internal::InternalMetadataWithArena _internal_metadata_;
  ::google::protobuf::internal::ArenaStringPtr message_;
  mutable ::google::protobuf::internal::CachedSize _cached_size_;
  friend struct ::protobuf_main_2eproto::TableStruct;
};
// ===================================================================

class EchoService_Stub;

class EchoService : public ::google::protobuf::Service {
 protected:
  // This class should be treated as an abstract interface.
  inline EchoService() {};
 public:
  virtual ~EchoService();

  typedef EchoService_Stub Stub;

  static const ::google::protobuf::ServiceDescriptor* descriptor();

  virtual void Echo(::google::protobuf::RpcController* controller,
                       const ::example::EchoRequest* request,
                       ::example::EchoResponse* response,
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
  GOOGLE_DISALLOW_EVIL_CONSTRUCTORS(EchoService);
};

class EchoService_Stub : public EchoService {
 public:
  EchoService_Stub(::google::protobuf::RpcChannel* channel);
  EchoService_Stub(::google::protobuf::RpcChannel* channel,
                   ::google::protobuf::Service::ChannelOwnership ownership);
  ~EchoService_Stub();

  inline ::google::protobuf::RpcChannel* channel() { return channel_; }

  // implements EchoService ------------------------------------------

  void Echo(::google::protobuf::RpcController* controller,
                       const ::example::EchoRequest* request,
                       ::example::EchoResponse* response,
                       ::google::protobuf::Closure* done);
 private:
  ::google::protobuf::RpcChannel* channel_;
  bool owns_channel_;
  GOOGLE_DISALLOW_EVIL_CONSTRUCTORS(EchoService_Stub);
};


// ===================================================================


// ===================================================================

#ifdef __GNUC__
  #pragma GCC diagnostic push
  #pragma GCC diagnostic ignored "-Wstrict-aliasing"
#endif  // __GNUC__
// EchoRequest

// string message = 1;
inline void EchoRequest::clear_message() {
  message_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& EchoRequest::message() const {
  // @@protoc_insertion_point(field_get:example.EchoRequest.message)
  return message_.GetNoArena();
}
inline void EchoRequest::set_message(const ::std::string& value) {
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:example.EchoRequest.message)
}
#if LANG_CXX11
inline void EchoRequest::set_message(::std::string&& value) {
  
  message_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:example.EchoRequest.message)
}
#endif
inline void EchoRequest::set_message(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:example.EchoRequest.message)
}
inline void EchoRequest::set_message(const char* value, size_t size) {
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:example.EchoRequest.message)
}
inline ::std::string* EchoRequest::mutable_message() {
  
  // @@protoc_insertion_point(field_mutable:example.EchoRequest.message)
  return message_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* EchoRequest::release_message() {
  // @@protoc_insertion_point(field_release:example.EchoRequest.message)
  
  return message_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void EchoRequest::set_allocated_message(::std::string* message) {
  if (message != NULL) {
    
  } else {
    
  }
  message_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), message);
  // @@protoc_insertion_point(field_set_allocated:example.EchoRequest.message)
}

// -------------------------------------------------------------------

// EchoResponse

// string message = 1;
inline void EchoResponse::clear_message() {
  message_.ClearToEmptyNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline const ::std::string& EchoResponse::message() const {
  // @@protoc_insertion_point(field_get:example.EchoResponse.message)
  return message_.GetNoArena();
}
inline void EchoResponse::set_message(const ::std::string& value) {
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), value);
  // @@protoc_insertion_point(field_set:example.EchoResponse.message)
}
#if LANG_CXX11
inline void EchoResponse::set_message(::std::string&& value) {
  
  message_.SetNoArena(
    &::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::move(value));
  // @@protoc_insertion_point(field_set_rvalue:example.EchoResponse.message)
}
#endif
inline void EchoResponse::set_message(const char* value) {
  GOOGLE_DCHECK(value != NULL);
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), ::std::string(value));
  // @@protoc_insertion_point(field_set_char:example.EchoResponse.message)
}
inline void EchoResponse::set_message(const char* value, size_t size) {
  
  message_.SetNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(),
      ::std::string(reinterpret_cast<const char*>(value), size));
  // @@protoc_insertion_point(field_set_pointer:example.EchoResponse.message)
}
inline ::std::string* EchoResponse::mutable_message() {
  
  // @@protoc_insertion_point(field_mutable:example.EchoResponse.message)
  return message_.MutableNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline ::std::string* EchoResponse::release_message() {
  // @@protoc_insertion_point(field_release:example.EchoResponse.message)
  
  return message_.ReleaseNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited());
}
inline void EchoResponse::set_allocated_message(::std::string* message) {
  if (message != NULL) {
    
  } else {
    
  }
  message_.SetAllocatedNoArena(&::google::protobuf::internal::GetEmptyStringAlreadyInited(), message);
  // @@protoc_insertion_point(field_set_allocated:example.EchoResponse.message)
}

#ifdef __GNUC__
  #pragma GCC diagnostic pop
#endif  // __GNUC__
// -------------------------------------------------------------------


// @@protoc_insertion_point(namespace_scope)

}  // namespace example

// @@protoc_insertion_point(global_scope)

#endif  // PROTOBUF_INCLUDED_main_2eproto
