#include "ARX_js.h"
#include <emscripten/bind.h>

using namespace emscripten;

enum ARLogLevel {
  ar_log_level_debug = AR_LOG_LEVEL_DEBUG,
  ar_log_level_INFO = AR_LOG_LEVEL_INFO,
  ar_log_level_WARN = AR_LOG_LEVEL_WARN,
  ar_log_level_ERROR = AR_LOG_LEVEL_ERROR,
  ar_log_level_REL_INFO = AR_LOG_LEVEL_REL_INFO
};

enum TrackableOptions {
  arw_tracker_option_nft_multimode = ARW_TRACKER_OPTION_NFT_MULTIMODE,
  arw_tracker_option_square_threshold = ARW_TRACKER_OPTION_SQUARE_THRESHOLD,
  arw_tracker_option_square_threshold_mode = ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE,
  arw_tracker_option_square_labeling_mode = ARW_TRACKER_OPTION_SQUARE_LABELING_MODE,
  arw_tracker_option_square_pattern_detection_mode = ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE,
  arw_tracker_option_square_border_size = ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE,
  arw_tracker_option_square_matrix_code_type = ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE,
  arw_tracker_option_square_image_proc_mode = ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE,
  arw_tracker_option_square_debug_mode = ARW_TRACKER_OPTION_SQUARE_DEBUG_MODE,
  arw_tracker_option_square_pattern_size = ARW_TRACKER_OPTION_SQUARE_PATTERN_SIZE,
  arw_tracker_option_square_pattern_count_max = ARW_TRACKER_OPTION_SQUARE_PATTERN_COUNT_MAX,
  arw_tracker_option_2d_tracker_feature_type = ARW_TRACKER_OPTION_2D_TRACKER_FEATURE_TYPE,
};

enum TrackableOptionsSettings {
  arw_trackable_option_filtered = ARW_TRACKABLE_OPTION_FILTERED,
  arw_trackable_option_filter_sample_rate = ARW_TRACKABLE_OPTION_FILTER_SAMPLE_RATE,
  arw_trackable_option_filter_cutoff_freq = ARW_TRACKABLE_OPTION_FILTER_CUTOFF_FREQ,
  arw_trackable_option_square_use_cont_pose_estimation = ARW_TRACKABLE_OPTION_SQUARE_USE_CONT_POSE_ESTIMATION,
  arw_trackable_option_square_confidence = ARW_TRACKABLE_OPTION_SQUARE_CONFIDENCE,
  arw_trackable_option_square_confidence_cutoff = ARW_TRACKABLE_OPTION_SQUARE_CONFIDENCE_CUTOFF,
  arw_trackable_option_nft_scale = ARW_TRACKABLE_OPTION_NFT_SCALE,
  arw_trackable_option_multi_min_submarkers = ARW_TRACKABLE_OPTION_MULTI_MIN_SUBMARKERS,
  arw_trackable_option_multi_min_conf_matrix = ARW_TRACKABLE_OPTION_MULTI_MIN_CONF_MATRIX,
  arw_trackable_option_multi_min_conf_pattern = ARW_TRACKABLE_OPTION_MULTI_MIN_CONF_PATTERN,
  arw_trackable_option_multi_min_inlier_prob = ARW_TRACKABLE_OPTION_MULTI_MIN_INLIER_PROB,
};

EMSCRIPTEN_BINDINGS(constant_bindings) {

  enum_<ARLogLevel>("ARLogLevel")
      .value("AR_LOG_LEVEL_DEBUG", ARLogLevel::ar_log_level_debug)
      .value("AR_LOG_LEVEL_INFO", ARLogLevel::ar_log_level_INFO)
      .value("AR_LOG_LEVEL_WARN", ARLogLevel::ar_log_level_WARN)
      .value("AR_LOG_LEVEL_ERROR", ARLogLevel::ar_log_level_ERROR)
      .value("AR_LOG_LEVEL_REL_INFO", ARLogLevel::ar_log_level_REL_INFO);

  function("setLogLevel", &arwSetLogLevel);

  /*** artoolkitX lifecycle functions ***/
  function("initialiseAR", &arwInitialiseAR);
  function("getARToolKitVersion", &getARToolKitVersion);
  function("arwStartRunningJS", &arwStartRunningJS);
  function("pushVideoInit", &pushVideoInit);
  function("getError", &arwGetError);

  function("isRunning", &arwIsRunning);
  function("isInitialized", &arwIsInited);
  function("stopRunning", &arwStopRunning);
  function("shutdownAR", &arwShutdownAR);

  /*** Video stream management ***/

  value_object<VideoParams>("VideoParams")
      .field("width", &VideoParams::width)
      .field("height", &VideoParams::height)
      .field("pixelSize", &VideoParams::pixelSize)
      .field("pixelFormat", &VideoParams::pixelFormat);
  function("getVideoParams", &getVideoParams);

  function("capture", &arwCapture);
  function("updateAR", &arwUpdateAR);
  function("updateTexture32", &updateTexture32);

  /*** Video stream retrieval and/or drawing ***/

  /*** Tracking configuration ***/
  enum_<TrackableOptions>("TrackableOptions")
      .value("ARW_TRACKER_OPTION_NFT_MULTIMODE", TrackableOptions::arw_tracker_option_nft_multimode)
      .value("ARW_TRACKER_OPTION_SQUARE_THRESHOLD", TrackableOptions::arw_tracker_option_square_threshold)
      .value("ARW_TRACKER_OPTION_SQUARE_THRESHOLD_MODE", TrackableOptions::arw_tracker_option_square_threshold_mode)
      .value("ARW_TRACKER_OPTION_SQUARE_LABELING_MODE", TrackableOptions::arw_tracker_option_square_labeling_mode)
      .value("ARW_TRACKER_OPTION_SQUARE_PATTERN_DETECTION_MODE", TrackableOptions::arw_tracker_option_square_pattern_detection_mode)
      .value("ARW_TRACKER_OPTION_SQUARE_BORDER_SIZE", TrackableOptions::arw_tracker_option_square_border_size)
      .value("ARW_TRACKER_OPTION_SQUARE_MATRIX_CODE_TYPE", TrackableOptions::arw_tracker_option_square_matrix_code_type)
      .value("ARW_TRACKER_OPTION_SQUARE_IMAGE_PROC_MODE", TrackableOptions::arw_tracker_option_square_image_proc_mode)
      .value("ARW_TRACKER_OPTION_SQUARE_DEBUG_MODE", TrackableOptions::arw_tracker_option_square_debug_mode)
      .value("ARW_TRACKER_OPTION_SQUARE_PATTERN_SIZE", TrackableOptions::arw_tracker_option_square_pattern_size)
      .value("ARW_TRACKER_OPTION_SQUARE_PATTERN_COUNT_MAX", TrackableOptions::arw_tracker_option_square_pattern_count_max)
      .value("ARW_TRACKER_OPTION_2D_TRACKER_FEATURE_TYPE", TrackableOptions::arw_tracker_option_2d_tracker_feature_type);

  function("setTrackerOptionBool", &arwSetTrackerOptionBool);
  function("setTrackerOptionInt", &arwSetTrackerOptionInt);
  function("setTrackerOptionFloat", &arwSetTrackerOptionFloat);
  function("getTrackerOptionBool", &arwGetTrackerOptionBool);
  function("arwGetTrackerOptionInt", &arwGetTrackerOptionInt);
  function("arwGetTrackerOptionFloat", &arwGetTrackerOptionFloat);

  enum_<AR_LABELING_THRESH_MODE>("LabelingThresholdMode")
      .value("AR_LABELING_THRESH_MODE_MANUAL", AR_LABELING_THRESH_MODE_MANUAL)
      .value("AR_LABELING_THRESH_MODE_AUTO_MEDIAN", AR_LABELING_THRESH_MODE_AUTO_MEDIAN)
      .value("AR_LABELING_THRESH_MODE_AUTO_OTSU", AR_LABELING_THRESH_MODE_AUTO_OTSU)
      .value("AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE", AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE)
      .value("AR_LABELING_THRESH_MODE_AUTO_BRACKETING", AR_LABELING_THRESH_MODE_AUTO_BRACKETING);

  enum_<AR_MATRIX_CODE_TYPE>("ARMatrixCodeType")
      .value("AR_MATRIX_CODE_3x3", AR_MATRIX_CODE_3x3)
      .value("AR_MATRIX_CODE_3x3_PARITY65", AR_MATRIX_CODE_3x3_PARITY65)
      .value("AR_MATRIX_CODE_3x3_HAMMING63", AR_MATRIX_CODE_3x3_HAMMING63)
      .value("AR_MATRIX_CODE_4x4", AR_MATRIX_CODE_4x4)
      .value("AR_MATRIX_CODE_4x4_BCH_13_9_3", AR_MATRIX_CODE_4x4_BCH_13_9_3)
      .value("AR_MATRIX_CODE_4x4_BCH_13_5_5", AR_MATRIX_CODE_4x4_BCH_13_5_5)
      .value("AR_MATRIX_CODE_5x5_BCH_22_12_5", AR_MATRIX_CODE_5x5_BCH_22_12_5)
      .value("AR_MATRIX_CODE_5x5_BCH_22_7_7", AR_MATRIX_CODE_5x5_BCH_22_7_7)
      .value("AR_MATRIX_CODE_5x5", AR_MATRIX_CODE_5x5)
      .value("AR_MATRIX_CODE_6x6", AR_MATRIX_CODE_6x6)
      .value("AR_MATRIX_CODE_GLOBAL_ID", AR_MATRIX_CODE_GLOBAL_ID);

  /*** Trackable management ***/

  /**
   * Adds a trackable as specified in the given configuration string. The format
   * of the string can be one of:
   * - Square marker from pattern file: "single;pattern_file;pattern_width",
   * e.g. "single;data/hiro.patt;80"
   * - Square marker from pattern passed in config:
   * "single_buffer;pattern_width;buffer=[]", e.g. "single_buffer;80;buffer=234
   * 221 237..."
   * - Square barcode marker: "single_barcode;barcode_id;pattern_width", e.g.
   * "single_barcode;0;80"
   * - Multi-square marker: "multi;config_file", e.g.
   * "multi;data/multi/marker.dat"
   * - NFT marker: "nft;nft_dataset_pathname", e.g. "nft;gibraltar"
   * @param cfg		The configuration string
   * @return			The unique identifier (UID) of the trackable instantiated
   * based on the configuration string, or -1 if an error occurred
   */
  function("addTrackable", &addTrackable);

  // TODO: To be implemented
  //  value_object<ARWTrackableStatus>("ARWTrackableStatus")
  //      .field("uid", &ARWTrackableStatus::uid)
  //      .field("visible", &ARWTrackableStatus::visible)
  //      .field("matrix", &ARWTrackableStatus::matrix)
  //      .field("matrixR", &ARWTrackableStatus::matrixR)
  //  ;
  //  function("getTrackables", &arwGetTrackables);
  function("removeTrackable", &arwRemoveTrackable);
  function("removeAllTrackables", &arwRemoveAllTrackables);

  //** ATTENTION: arwQueryTrackableVisibilityAndTransformation is exported
  //inside ARX_additions.js
  function("getTrackablePatternCount", &arwGetTrackablePatternCount);
  //** ATTENTION: arwGetTrackablePatternConfig is exported inside
  //ARX_additions.js
  //** ATTENTION: arwGetTrackablePatternImage is exported inside
  //ARX_additions.js

  enum_<TrackableOptionsSettings>("TrackableOptionsSettings")
      .value("ARW_TRACKABLE_OPTION_FILTERED", arw_trackable_option_filtered)
      .value("ARW_TRACKABLE_OPTION_FILTER_SAMPLE_RATE", arw_trackable_option_filter_sample_rate)
      .value("ARW_TRACKABLE_OPTION_FILTER_CUTOFF_FREQ", arw_trackable_option_filter_cutoff_freq)
      .value("ARW_TRACKABLE_OPTION_SQUARE_USE_CONT_POSE_ESTIMATION", arw_trackable_option_square_use_cont_pose_estimation)
      .value("ARW_TRACKABLE_OPTION_SQUARE_CONFIDENCE", arw_trackable_option_square_confidence)
      .value("ARW_TRACKABLE_OPTION_SQUARE_CONFIDENCE_CUTOFF", arw_trackable_option_square_confidence_cutoff)
      .value("ARW_TRACKABLE_OPTION_NFT_SCALE", arw_trackable_option_nft_scale)
      .value("ARW_TRACKABLE_OPTION_MULTI_MIN_SUBMARKERS", arw_trackable_option_multi_min_submarkers)
      .value("ARW_TRACKABLE_OPTION_MULTI_MIN_CONF_MATRIX", arw_trackable_option_multi_min_conf_matrix)
      .value("ARW_TRACKABLE_OPTION_MULTI_MIN_CONF_PATTERN", arw_trackable_option_multi_min_conf_pattern);

  function("setTrackableOptionBool", &arwSetTrackableOptionBool);
  function("setTrackableOptionInt", &arwSetTrackableOptionInt);
  function("setTrackableOptionFloat", &arwSetTrackableOptionFloat);
  function("getTrackableOptionBool", &arwGetTrackableOptionBool);
  function("getTrackableOptionInt", &arwGetTrackableOptionInt);
  function("getTrackableOptionFloat", &arwGetTrackableOptionFloat);

  /*** Utility ***/

  //** ATTENTION: arwLoadOpticalParams is exported inside ARX_additions.js

  /*** Constants ***/

  /* for arPatternDetectionMode */
  constant("AR_TEMPLATE_MATCHING_COLOR", AR_TEMPLATE_MATCHING_COLOR);
  constant("AR_TEMPLATE_MATCHING_MONO", AR_TEMPLATE_MATCHING_MONO);
  constant("AR_MATRIX_CODE_DETECTION", AR_MATRIX_CODE_DETECTION);
  constant("AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX", AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX);
  constant("AR_TEMPLATE_MATCHING_MONO_AND_MATRIX", AR_TEMPLATE_MATCHING_MONO_AND_MATRIX);
  constant("AR_DEFAULT_PATTERN_DETECTION_MODE", AR_DEFAULT_PATTERN_DETECTION_MODE);

  /* for labelingMode */
  constant("AR_LABELING_WHITE_REGION", AR_LABELING_WHITE_REGION);
  constant("AR_LABELING_BLACK_REGION", AR_LABELING_BLACK_REGION);

  /* Pattern ratio */
  constant("AR_PATT_RATIO", AR_PATT_RATIO);

  /* image processing mode */
  constant("AR_IMAGE_PROC_FRAME_IMAGE", AR_IMAGE_PROC_FRAME_IMAGE);
  constant("AR_IMAGE_PROC_FIELD_IMAGE", AR_IMAGE_PROC_FRAME_IMAGE);
}
