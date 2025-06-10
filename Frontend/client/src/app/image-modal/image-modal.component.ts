import { Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-image-modal',
  standalone:true,
  imports: [MatDialogModule],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ImageModalComponent {
  @ViewChild('zoomImage') zoomImage!: ElementRef<HTMLImageElement>;
  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLDivElement>;
  scale: number = 1;
  dragging: boolean = false;
  lastX: number = 0;
  lastY: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { imgSrc: string }) {}

  onZoom(event: WheelEvent): void {
    event.preventDefault();
    const zoomIntensity = 0.1;
    const direction = event.deltaY < 0 ? 1 : -1;
    this.scale = Math.min(Math.max(this.scale * (1 + zoomIntensity * direction), 1), 3);
    this.updateTransform();
  }

  toggleZoom(): void {
    this.scale = this.scale > 1 ? 1 : 2;
    this.updateTransform();
  }

  updateTransform(): void {
    this.zoomImage.nativeElement.style.transform = `scale(${this.scale})`;
  }

  startDragging(event: MouseEvent): void {
    event.preventDefault();
    if (event.button === 0) {  // Provjeravamo je li pritisnut lijevi klik (button === 0)
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    }
  }

  onDrag(event: MouseEvent): void {
    if (this.dragging && this.scale > 1) {
      const sensitivity = 4; // Faktor osjetljivosti (povećajte za brže pomicanje, smanjite za sporije)
      const dx = (event.clientX - this.lastX) * sensitivity;
      const dy = (event.clientY - this.lastY) * sensitivity;
  
      if (this.zoomImage && this.imageContainer) {
        const imgRect = this.zoomImage.nativeElement.getBoundingClientRect();
        const containerRect = this.imageContainer.nativeElement.getBoundingClientRect();
  
        // Postojeće transformacije
        const style = getComputedStyle(this.zoomImage.nativeElement);
        const transformMatrix = style.transform.match(/matrix\(([^)]+)\)/);
        let translateX = 0;
        let translateY = 0;
  
        if (transformMatrix && transformMatrix.length > 1) {
          const matrixValues = transformMatrix[1].split(', ').map(parseFloat);
          translateX = matrixValues[4];
          translateY = matrixValues[5];
        }
  
        // Izračun granica
        const maxTranslateX = (imgRect.width * this.scale - containerRect.width) / 2;
        const maxTranslateY = (imgRect.height * this.scale - containerRect.height) / 2;
  
        // Ograničavanje pomicanja slike unutar dijaloga
        translateX = Math.max(-maxTranslateX, Math.min(translateX + dx, maxTranslateX));
        translateY = Math.max(-maxTranslateY, Math.min(translateY + dy, maxTranslateY));
  
        // Primijeniti transformaciju
        this.zoomImage.nativeElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.scale})`;
  
        // Ažurirati posljednju poziciju miša
        this.lastX = event.clientX;
        this.lastY = event.clientY;
      }
    }
  }
  
  
  
  
  

  stopDragging(): void {
    this.dragging = false;
  }  
}
  