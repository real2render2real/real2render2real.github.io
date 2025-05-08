class BaseCarousel {
  constructor(options) {
    this.containerId = options.containerId;
    this.slideRowId = options.slideRowId;
    this.prevBtnId = options.prevBtnId;
    this.nextBtnId = options.nextBtnId;
    
    this.currentThumbnail = 0;
    this.thumbnailFromIndex = {};
    this.thumbnailCount = 0;
    
    this.setupNavigation();
  }
  
  setupNavigation() {
    $(`#${this.prevBtnId}`).click(() => this.slidePrev());
    $(`#${this.nextBtnId}`).click(() => this.slideNext());
  }
  
  createThumbnails($switcher, items) {
    // Clear the container
    $switcher.empty();
    
    // Add thumbnail buttons
    items.forEach((item, index) => {
      const $input = $("<button>", {
        class: "thumbnail-btn",
        id: item.id
      });
      
      // Use thumbnail image if provided, or generate from video source
      const imgSrc = item.imgSrc || (item.videoSrc ? item.videoSrc.replace('.mp4', '-thumb.jpg') : 'data/thumbnails/placeholder.png');
      
      const $img = $("<img>", {
        class: "thumbnails",
        alt: item.label,
        src: imgSrc
      });
      
      const $label = $("<label>", {
        text: item.label,
        class: "thumbnail_label"
      });
      
      $input.append($img).append($label);
      $switcher.append($input);
      
      this.thumbnailCount++;
      this.thumbnailFromIndex[index] = $input[0];
      
      $input.click(() => this.handleThumbnailClick(item, index, $input));
    });
  }
  
  handleThumbnailClick(item, index, $input) {
    this.currentThumbnail = index;
    
    // Update thumbnail appearance - reset all thumbnails first
    $(`#${this.slideRowId} .thumbnail-btn`).css('opacity', '0.7');
    // Then highlight the selected thumbnail
    $input.css('opacity', '1.0');
    
    // Scroll to make thumbnail visible
    const slider_window = document.getElementById(this.slideRowId);
    if (slider_window) {
      slider_window.scrollLeft = $input[0].offsetLeft - slider_window.offsetWidth / 2 + $input.width() / 2;
    }
    
    // Subclasses should override this method to show appropriate content
  }
  
  slidePrev() {
    if (this.thumbnailCount === 0) return;
    
    const newIndex = ((this.currentThumbnail - 1 + this.thumbnailCount) % this.thumbnailCount);
    const newThumbnail = this.thumbnailFromIndex[newIndex];
    if (newThumbnail) {
      $(newThumbnail).click();
    }
  }
  
  slideNext() {
    if (this.thumbnailCount === 0) return;
    
    const newIndex = (this.currentThumbnail + 1) % this.thumbnailCount;
    const newThumbnail = this.thumbnailFromIndex[newIndex];
    if (newThumbnail) {
      $(newThumbnail).click();
    }
  }
  
  // Activates the first thumbnail
  activateFirst() {
    if (this.thumbnailCount > 0) {
      $(this.thumbnailFromIndex[0]).click();
    }
  }
}

class CombinedCarousel extends BaseCarousel {
  constructor(options) {
    super(options);
    this.iframeIds = options.iframeIds || [];
    this.videoIds = options.videoIds || [];
    this.init();
  }
  
  init() {
    const $switcher = $(`#${this.slideRowId}`);
    
    // Collect data from existing elements
    const items = [];
    $switcher.children().each((index, child) => {
      items.push({
        id: $(child).data("id"),
        imgSrc: $(child).data("img-src"),
        label: $(child).data("label")
      });
    });
    
    // Create thumbnails
    this.createThumbnails($switcher, items);
    
    // Show first items
    this.activateFirst();
  }
  
  handleThumbnailClick(item, index, $input) {
    super.handleThumbnailClick(item, index, $input);
    
    const contentId = item.id.replace('-thumb', '');
    this.showIframe(contentId);
    this.showVideo(contentId + '_video');
  }
  
  showIframe(iframeId) {
    this.iframeIds.forEach(id => {
      const iframe = document.getElementById(id);
      if (iframe) {
        if (id === iframeId) {
          iframe.classList.add('show');
          // Only set src if it's not already set
          if (!iframe.src || iframe.src === 'about:blank') {
            iframe.src = $(iframe).data('src');
          }
        } else {
          iframe.classList.remove('show');
          // Set to about:blank to stop any running content
          iframe.src = "about:blank";
        }
      }
    });
  }
  
  showVideo(videoId) {
    this.videoIds.forEach(id => {
      const video = document.getElementById(id);
      if (video) {
        if (id === videoId) {
          video.classList.add('show');
          const videoElement = video.querySelector('video');
          if (videoElement) {
            videoElement.play().catch(e => console.log("Video play error:", e));
          }
        } else {
          video.classList.remove('show');
          const videoElement = video.querySelector('video');
          if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
          }
        }
      }
    });
  }
}

class IframeCarousel extends BaseCarousel {
  constructor(options) {
    super(options);
    this.iframeIds = options.iframeIds || [];
    this.init();
  }
  
  init() {
    const $switcher = $(`#${this.slideRowId}`);
    
    // Collect data from existing elements
    const items = [];
    $switcher.children().each((index, child) => {
      items.push({
        id: $(child).data("id"),
        imgSrc: $(child).data("img-src"),
        label: $(child).data("label")
      });
    });
    
    // Create thumbnails
    this.createThumbnails($switcher, items);
    
    // Show first item
    this.activateFirst();
  }
  
  handleThumbnailClick(item, index, $input) {
    super.handleThumbnailClick(item, index, $input);
    
    const iframeId = item.id.replace('-thumb', '');
    this.showIframe(iframeId);
  }
  
  showIframe(iframeId) {
    this.iframeIds.forEach(id => {
      const iframe = document.getElementById(id);
      if (iframe) {
        if (id === iframeId) {
          iframe.classList.add('show');
          // Only set src if it's not already set
          if (!iframe.src || iframe.src === 'about:blank') {
            iframe.src = $(iframe).data('src');
          }
        } else {
          iframe.classList.remove('show');
          // Set to about:blank to stop any running content
          iframe.src = "about:blank";
        }
      }
    });
  }
}

class VideoCarousel extends BaseCarousel {
  constructor(options) {
    super(options);
    this.videoContainerId = options.videoContainerId;
    
    // For custom video list approach
    if (options.videos) {
      this.videos = options.videos;
      this.initWithVideosList();
    } else {
      // For DOM-based approach
      this.init();
    }
  }
  
  init() {
    const $switcher = $(`#${this.slideRowId}`);
    
    // Collect data from existing elements
    const items = [];
    $switcher.children().each((index, child) => {
      items.push({
        id: $(child).data("id"),
        videoSrc: $(child).data("video-src"),
        imgSrc: $(child).data("img-src"), // Support explicit thumbnail images
        label: $(child).data("label")
      });
    });
    
    // Create video elements if needed
    this.createVideoElements(items);
    
    // Create thumbnails
    this.createThumbnails($switcher, items);
    
    // Show first video
    this.activateFirst();
  }
  
  initWithVideosList() {
    const $switcher = $(`#${this.slideRowId}`);
    
    // Generate thumbnails for videos if not provided
    this.videos.forEach((video, index) => {
      if (!video.id) {
        // Create a unique ID based on the video label
        video.id = `video-${this.containerId}-${index}-thumb`;
      }
      
      // Use provided thumbnail or default to video-based naming convention
      if (!video.imgSrc) {
        // Extract the filename without extension
        const baseName = video.src.split('/').pop().replace('.mp4', '');
        video.imgSrc = `data/thumbnails/${baseName}.png`;
      }
    });
    
    // Create video elements
    this.createVideoElements(this.videos);
    
    // Create thumbnails
    this.createThumbnails($switcher, this.videos);
    
    // Show first video
    this.activateFirst();
  }
  
  createVideoElements(items) {
    const $container = $(`#${this.videoContainerId}`);
    $container.empty();
    
    items.forEach((item) => {
      const videoId = item.id ? item.id.replace('-thumb', '') : `video-${this.containerId}-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
      
      const $videoContainer = $("<div>", {
        class: "video-item",
        id: videoId
      });
      
      const $video = $("<video>", {
        autoplay: false,
        muted: true,
        loop: true,
        playsinline: true,
        controls: true,
        // height: "300px"
      });
      
      const $source = $("<source>", {
        src: item.videoSrc || item.src,
        type: "video/mp4"
      });
      
      $video.append($source);
      $videoContainer.append($video);
      $container.append($videoContainer);
      
      // Update item id if it was created
      if (!item.id) {
        item.id = `${videoId}-thumb`;
      }
    });
  }
  
  handleThumbnailClick(item, index, $input) {
    super.handleThumbnailClick(item, index, $input);
    
    const videoId = item.id.replace('-thumb', '');
    this.showVideo(videoId);
  }
  
  showVideo(videoId) {
    $(`#${this.videoContainerId} .video-item`).each((index, container) => {
      const $container = $(container);
      const $video = $container.find('video')[0];
      
      if (container.id === videoId) {
        $container.addClass('show');
        if ($video) {
          $video.play().catch(e => console.log("Video play error:", e));
        }
      } else {
        $container.removeClass('show');
        if ($video) {
          $video.pause();
          $video.currentTime = 0;
        }
      }
    });
  }
}

// Initialize when document is ready
$(document).ready(function() {
  // Combined carousel (original)
  const combinedCarousel = new CombinedCarousel({
    containerId: 'mainCarousel',
    slideRowId: 'results-objs-scroll',
    prevBtnId: 'results-slide-arrow-prev',
    nextBtnId: 'results-slide-arrow-next',
    iframeIds: ['tiger', 'mug', 'package', 'drawer', 'faucet'],
    videoIds: ['tiger_video', 'mug_video', 'package_video', 'drawer_video', 'faucet_video']
  });
  
  // Iframe-only carousel
  const iframeCarousel = new IframeCarousel({
    containerId: 'iframeCarousel',
    slideRowId: 'iframe-objs-scroll',
    prevBtnId: 'iframe-slide-arrow-prev',
    nextBtnId: 'iframe-slide-arrow-next',
    iframeIds: ['tiger', 'mug', 'package'] // Your iframe IDs
  });
  
  // Video-only carousel 1 (DOM-based)
  const videoCarousel1 = new VideoCarousel({
    containerId: 'videoCarousel1',
    slideRowId: 'video-objs-scroll-1',
    videoContainerId: 'video-display-1',
    prevBtnId: 'video-slide-arrow-prev-1',
    nextBtnId: 'video-slide-arrow-next-1'
  });
  
  // // Video-only carousel 2 (using video list approach)
  // const videoCarousel2 = new VideoCarousel({
  //   containerId: 'videoCarousel2',
  //   slideRowId: 'video-objs-scroll-2',
  //   videoContainerId: 'video-display-2',
  //   prevBtnId: 'video-slide-arrow-prev-2',
  //   nextBtnId: 'video-slide-arrow-next-2',
  //   videos: [
  //     { 
  //       src: 'data/demo_vids/tiger_demo.mp4', 
  //       label: 'Tiger',
  //       imgSrc: 'data/thumbnails/tiger.png'
  //     },
  //     { 
  //       src: 'data/demo_vids/mug_demo.mp4', 
  //       label: 'Coffee Maker',
  //       imgSrc: 'data/thumbnails/mug.png'
  //     },
  //     { 
  //       src: 'data/demo_vids/package_demo.mp4', 
  //       label: 'Package',
  //       imgSrc: 'data/thumbnails/package.png'
  //     }
  //   ]
  // });
});