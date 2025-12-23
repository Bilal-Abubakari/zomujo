export enum RadiologySection {
  PlainRadiology = 'Plain Radiology',
  UltrasoundScans = 'Ultrasound Scans',
  SpecializedImaging = 'Specialized Imaging',
  InterventionalRadiology = 'Interventional Radiology',
}

export enum PlainRadiologyCategory {
  ChestXRay = 'Chest X-Ray',
  AbdominalXRay = 'Abdominal X-Ray',
  SkeletalXRay = 'Skeletal X-Ray',
  SpineXRay = 'Spine X-Ray',
  PelvisXRay = 'Pelvis X-Ray',
  SkullXRay = 'Skull X-Ray',
  Others = 'Others',
}

export enum UltrasoundScansCategory {
  AbdominalUltrasound = 'Abdominal Ultrasound',
  PelvicUltrasound = 'Pelvic Ultrasound',
  ObstetricUltrasound = 'Obstetric Ultrasound',
  BreastUltrasound = 'Breast Ultrasound',
  ThyroidUltrasound = 'Thyroid Ultrasound',
  MusculoskeletalUltrasound = 'Musculoskeletal Ultrasound',
  VascularDoppler = 'Vascular Doppler',
  Others = 'Others',
}

export enum SpecializedImagingCategory {
  CTScan = 'CT Scan',
  MRI = 'MRI',
  Mammography = 'Mammography',
  Fluoroscopy = 'Fluoroscopy',
  DEXA = 'DEXA Scan (Bone Density)',
  Others = 'Others',
}

export enum InterventionalRadiologyCategory {
  Biopsy = 'Image-Guided Biopsy',
  Drainage = 'Drainage Procedures',
  Angiography = 'Angiography',
  Others = 'Others',
}
