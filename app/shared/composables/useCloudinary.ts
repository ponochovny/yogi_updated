export interface MediaObject {
	url: string
	providerPublicId: string
}

type WindowCloudinary = { cloudinary: { createUploadWidget: unknown } }

const openUploadWidget = (
	options: {
		multiple: boolean
		cropping: boolean
		isCamera?: boolean
		aspectRatio?: number
	},
	onSuccess: (media: MediaObject) => void,
) => {
	const {
		public: { cloudinaryName, cloudinaryUploadPreset },
	} = useRuntimeConfig()

	if (
		typeof window !== 'undefined' &&
		(window as WindowCloudinary).cloudinary
	) {
		// @ts-expect-error: window.cloudinary can be undefined, but we've already checked for it
		const widget = (window as WindowCloudinary).cloudinary.createUploadWidget(
			{
				cloudName: cloudinaryName,
				uploadPreset: cloudinaryUploadPreset,
				sources: ['local', 'url', ...(options.isCamera ? ['camera'] : [])],
				clientAllowedFormats: ['png', 'jpeg', 'webp', 'jpg'],
				croppingAspectRatio: options.aspectRatio || undefined,
				maxImageFileSize: 5000000,
				multiple: options.multiple,
				cropping: options.cropping,
			},
			// @ts-expect-error: window.cloudinary can be undefined, but we've already checked for it
			(error, result) => {
				// IMPORTANT: If multiple: true, the "success" event fires for EACH file separately!
				if (!error && result && result.event === 'success') {
					onSuccess({
						url: result.info.secure_url,
						providerPublicId: result.info.public_id,
					})
				}
			},
		)
		widget.open()
	}
}

export default openUploadWidget
